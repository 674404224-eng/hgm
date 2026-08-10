import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginScreen } from "../src/features/auth/LoginScreen";

function renderLogin(onLogin = vi.fn(), onToast = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={queryClient}><LoginScreen onLogin={onLogin} onToast={onToast} /></QueryClientProvider>);
  return { onLogin, onToast };
}

describe("LoginScreen", () => {
  it("阻止空表单提交并给出全局提示", async () => {
    const { onToast, onLogin } = renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /登录 \/ 注册/ }));
    await waitFor(() => expect(onToast).toHaveBeenCalledWith("请输入正确的 11 位手机号"));
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("手机号和验证码有效时创建登录会话", async () => {
    const { onLogin } = renderLogin();
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "15905818327" } });
    fireEvent.change(screen.getByLabelText("短信验证码"), { target: { value: "123456" } });
    await userEvent.click(screen.getByRole("button", { name: /登录 \/ 注册/ }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({
      access_token: "mock-access-token",
      user: expect.objectContaining({ phone: "15905818327" }),
    })));
  });
});
