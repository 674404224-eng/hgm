import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowRight, IconPhone, IconShieldCheck, IconSparkles } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../api";
import { useLoginMutation } from "../../api/hooks";
import type { Session } from "../../types/domain";

const loginSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, "请输入正确的 11 位手机号"),
  code: z.string().regex(/^\d{6}$/, "请输入 6 位验证码"),
  agreed: z.literal(true, { error: "请先阅读并同意服务协议与隐私政策" }),
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginScreenProps = {
  onLogin(session: Session): void;
  onToast(message: string): void;
};

function LoginBrand() {
  return <div className="brand" aria-label="策量智算 Video Studio"><span className="brand-mark"><IconSparkles size={31} stroke={2.1} /></span><span className="brand-copy"><strong>策量智算</strong><small>VIDEO STUDIO</small></span></div>;
}

export function LoginScreen({ onLogin, onToast }: LoginScreenProps) {
  const [countdown, setCountdown] = useState(0);
  const loginMutation = useLoginMutation();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", code: "", agreed: true },
  });

  useEffect(() => {
    if (!countdown) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const sendCode = async () => {
    const phone = getValues("phone");
    if (!/^1\d{10}$/.test(phone)) return onToast("请输入正确的 11 位手机号");
    try {
      await api.auth.sendSmsCode({ phone, scene: "login" });
      setCountdown(60);
      onToast(api.isMock ? "验证码已发送，Mock 模式可输入任意 6 位数字" : "验证码已发送");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "验证码发送失败");
    }
  };

  const submit = handleSubmit(async ({ phone, code }) => {
    try {
      const session = await loginMutation.mutateAsync({ phone, code });
      onLogin(session);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "登录失败");
    }
  }, (formErrors) => onToast(Object.values(formErrors)[0]?.message || "请检查登录信息"));

  return <main className="login-view"><header className="login-brand"><LoginBrand /></header><section className="login-card"><div className="login-heading"><span className="login-icon"><IconPhone size={25} /></span><h1>欢迎使用策量智算</h1><p>使用手机号快捷登录，继续你的 AI 创作。</p></div><form className="login-form" onSubmit={submit}><label><span>手机号</span><div className="phone-input"><strong>+86</strong><input inputMode="numeric" autoComplete="tel" maxLength={11} {...register("phone", { setValueAs: (value) => String(value).replace(/\D/g, "") })} placeholder="请输入手机号" aria-label="手机号" aria-invalid={Boolean(errors.phone)} /></div></label><label><span>短信验证码</span><div className="code-input"><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register("code", { setValueAs: (value) => String(value).replace(/\D/g, "") })} placeholder="请输入 6 位验证码" aria-label="短信验证码" aria-invalid={Boolean(errors.code)} /><button type="button" disabled={countdown > 0} onClick={sendCode}>{countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}</button></div></label><label className="agreement"><input type="checkbox" {...register("agreed")} /><span>我已阅读并同意<a href="#terms">《服务协议》</a>和<a href="#privacy">《隐私政策》</a></span></label><button className="login-submit" type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? "登录中…" : "登录 / 注册"}<IconArrowRight size={18} /></button></form><div className="login-security"><IconShieldCheck size={17} /><span>验证码仅用于身份验证，新手机号将自动创建账户。</span></div></section><footer className="login-footer">© 2026 策量智算 · VIDEO STUDIO</footer></main>;
}
