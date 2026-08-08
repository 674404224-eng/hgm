import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconCoin,
  IconCopy,
  IconDownload,
  IconEye,
  IconHome,
  IconLock,
  IconLogout,
  IconPhoto,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconRocket,
  IconMoodSmile,
  IconCat,
  IconGhost,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconUserCircle,
  IconVideo,
  IconX,
} from "@tabler/icons-react";

const assets = {
  city: "/assets/neon-city.png",
  car: "/assets/coastal-car.png",
  mountain: "/assets/alpine-travel.png",
  product: "/assets/smart-speaker.png",
  interior: "/assets/warm-interior.png",
};

const avatarIconLibrary = [IconRobot, IconRocket, IconMoodSmile, IconCat, IconGhost];
const createBackendAvatarSeed = () => Math.floor(Math.random() * avatarIconLibrary.length);

const recommendations = [
  { title: "都市霓虹 · 产品宣传片", meta: ["16:9", "30s"], image: assets.city, prompt: "雨夜霓虹城市街道，镜头贴近湿润地面缓慢推进，蓝紫色灯光在路面反射，电影感产品宣传片。" },
  { title: "动感驾驭 · 汽车广告", meta: ["16:9", "20s"], image: assets.car, prompt: "银色汽车沿海岸公路疾驰，跟车与航拍镜头切换，阳光清透，突出速度、操控和自由感。" },
  { title: "探索无界 · 旅行短片", meta: ["16:9", "30s"], image: assets.mountain, prompt: "独行者站在雪山观景点，镜头由背影缓慢拉远，展现辽阔山脉与云层，史诗感旅行短片。" },
  { title: "极简科技 · 产品展示", meta: ["16:9", "15s"], image: assets.product, prompt: "黑色智能音箱置于深蓝摄影棚，蓝色光带扫过金属表面，镜头环绕展示细节，高端科技质感。" },
  { title: "生活美学 · 品牌故事", meta: ["16:9", "45s"], image: assets.interior, prompt: "午后阳光照进现代客厅，镜头从绿植缓慢移动到焦糖色座椅，温暖、克制、有生活方式品牌质感。" },
];

const initialTasks = [
  { id: 1, title: "新品发布宣传片", meta: "16:9 · 1080P · 30s", cost: 32, status: "done", progress: 100, image: assets.city, created: "刚刚" },
  { id: 2, title: "产品功能演示", meta: "16:9 · 720P · 20s", cost: 18, status: "queued", progress: 0, image: assets.product, created: "2 分钟前" },
  { id: 3, title: "品牌故事短片", meta: "16:9 · 1080P · 45s", cost: 45, status: "generating", progress: 32, image: assets.mountain, created: "5 分钟前" },
  { id: 4, title: "社媒推广视频", meta: "9:16 · 720P · 15s", cost: 16, status: "queued", progress: 0, image: assets.interior, created: "8 分钟前" },
  { id: 5, title: "节日促销海报视频", meta: "1:1 · 1080P · 10s", cost: 14, status: "queued", progress: 0, image: assets.interior, created: "12 分钟前" },
];

const initialProviders = [
  { id: "ark-primary", name: "火山方舟", endpoint: "ark.cn-beijing.volces.com", credential: "••••••••9K2M", enabled: true, models: [{ name: "Seedance 1.0 Pro", mode: "video" }, { name: "Seedance 1.0 Lite", mode: "video" }, { name: "Seedream 4.0", mode: "image" }, { name: "Seedream 3.0", mode: "image" }] },
  { id: "vidu-primary", name: "Vidu", endpoint: "api.vidu.cn", credential: "••••••••4D7Q", enabled: true, models: [{ name: "Vidu Q2 Pro", mode: "video" }] },
  { id: "flux-backup", name: "Flux API", endpoint: "api.bfl.ai", credential: "••••••••7A1F", enabled: false, models: [{ name: "Flux 1.1 Pro", mode: "image" }] },
];

const transactionRecords = [
  { id: "TX-20260808-001", time: "2026-08-08 14:32", type: "任务消耗", account: "个人", reference: "新品发布宣传片", detail: "Seedance 1.0 Pro", amount: -32 },
  { id: "TX-20260801-001", time: "2026-08-01 09:00", type: "套餐发放", account: "企业", reference: "企业专业版月度额度", detail: "有效期至 2026-08-31", amount: 16000 },
  { id: "TX-20260728-115", time: "2026-07-28 16:15", type: "任务消耗", account: "个人", reference: "品牌故事短片", detail: "Seedance 1.0 Pro", amount: -45 },
  { id: "TX-20260720-006", time: "2026-07-20 11:20", type: "活动奖励", account: "企业", reference: "夏季创作活动", detail: "奖励已到账", amount: 500 },
  { id: "TX-20260718-103", time: "2026-07-18 18:06", type: "任务消耗", account: "个人", reference: "产品功能演示", detail: "Vidu Q2 Pro", amount: -18 },
];

const modeConfig = {
  video: { label: "视频生成", icon: IconPlayerPlayFilled, placeholder: "描述你的创意，越具体越好（支持中英文）。例如：@图片1 中的人物在雨夜街头缓慢转身，霓虹灯映照在湿润地面上，电影感。" },
  image: { label: "图片生成", icon: IconPhoto, placeholder: "描述想生成的画面、主体、构图、光线和风格。例如：极简科技产品摄影，深蓝背景，冷色轮廓光，居中构图。" },
};

function Brand() {
  return <div className="brand" aria-label="策量智算 Video Studio"><span className="brand-mark"><IconSparkles size={31} stroke={2.1} /></span><span className="brand-copy"><strong>策量智算</strong><small>VIDEO STUDIO</small></span></div>;
}

function GeneratedAvatar({ seed, className = "" }) {
  const AvatarIcon = avatarIconLibrary[seed % avatarIconLibrary.length];
  return <span className={`generated-avatar avatar-tone-${seed % avatarIconLibrary.length} ${className}`} role="img" aria-label="系统随机生成头像" title="系统随机生成头像"><AvatarIcon aria-hidden="true" /></span>;
}

function Topbar({ view, setView, onAccount, onAccountSettings, onLogout, avatarSeed, credits = 0 }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <Brand />
      <nav className="top-nav" aria-label="主导航">
        <button className={view === "home" ? "active" : ""} onClick={() => { setView("home"); setOpen(false); }}><IconHome size={18} />首页</button>
        <button className={view === "tasks" ? "active" : ""} onClick={() => { setView("tasks"); setOpen(false); }}><IconChecklist size={18} />任务中心</button>
      </nav>
      <div className="topbar-spacer" />
      <button className="credits" onClick={() => setOpen(false)}><IconCoin size={18} fill="currentColor" /><span>创作点</span><strong>{credits.toLocaleString()}</strong></button>
      <div className="profile-wrap">
        <button className="profile" aria-label="打开账号菜单" aria-expanded={open} onClick={() => setOpen((value) => !value)}><GeneratedAvatar seed={avatarSeed} /><span className="online-dot" /><IconChevronDown size={16} /></button>
        {open && <div className="profile-menu"><div className="profile-summary"><GeneratedAvatar seed={avatarSeed} /><span><strong>林溪</strong><small>创作点 {credits.toLocaleString()}</small></span></div><button onClick={() => { onAccount(); setOpen(false); }}><IconUserCircle size={17} />用户中心</button><button onClick={() => { onAccountSettings(); setOpen(false); }}><IconSettings size={17} />账户设置</button><div className="profile-divider" /><button className="logout-item" onClick={() => { onLogout(); setOpen(false); }}><IconLogout size={17} />退出登录</button></div>}
      </div>
    </header>
  );
}

function ModeTabs({ mode, setMode }) {
  return <div className="mode-tabs" role="tablist" aria-label="创作模式">{Object.entries(modeConfig).map(([key, item]) => { const Icon = item.icon; return <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}><Icon size={18} />{item.label}</button>; })}</div>;
}

function ParameterSelect({ label, value, onChange, options, ariaLabel, className = "" }) {
  return <label className={`parameter-field ${className}`}><span>{label}</span><span className="select-control"><select value={value} onChange={(event) => onChange?.(event.target.value)} aria-label={ariaLabel}>{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select><IconChevronDown size={16} aria-hidden="true" /></span></label>;
}

function ComposerWithInitial({ initialPrompt, onGenerate, onToast, providers }) {
  const [mode, setMode] = useState("video");
  const [model, setModel] = useState("Seedance 1.0 Pro");
  const [aspect, setAspect] = useState("16:9");
  const [resolution, setResolution] = useState("1080P");
  const [duration, setDuration] = useState("10s");
  const [sound, setSound] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [reference, setReference] = useState(null);
  const fileRef = useRef(null);

  const availableModels = useMemo(() => providers.filter((provider) => provider.enabled).flatMap((provider) => provider.models.filter((item) => item.mode === mode).map((item) => ({ value: item.name, label: `${item.name} · ${provider.name}` }))), [mode, providers]);

  useEffect(() => {
    setModel(availableModels[0]?.value || "");
    if (mode === "video") { setAspect("16:9"); setResolution("1080P"); }
    else { setAspect("1:1"); setResolution("2K"); }
  }, [mode, availableModels]);

  const chooseFile = (file) => {
    if (!file) return;
    setReference({ name: file.name, type: file.type, file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
    onToast("参考素材已添加，仅用于本次任务");
  };

  const submit = async () => {
    if (!prompt.trim()) return onToast("先写下你的创意，再开始生成");
    if (!model) return onToast("请先在用户中心启用一个可用的模型 API");
    if (watermark && !watermarkText.trim()) return onToast("请输入水印文字，或关闭水印");
    try {
      await onGenerate({ prompt, mode, reference, model, aspect, resolution, duration, sound, watermark: watermark ? watermarkText.trim() : "" });
      setPrompt(""); setReference(null);
    } catch (error) { onToast(error.message || "任务提交失败，请稍后重试"); }
  };

  return (
    <section className="composer-card" aria-label="AI 创作输入">
      <ModeTabs mode={mode} setMode={setMode} />
      <div className="prompt-box">
        <textarea value={prompt} maxLength={1000} onChange={(event) => setPrompt(event.target.value)} placeholder={modeConfig[mode].placeholder} aria-label="创意描述" />
        <div className="prompt-tools">
          <input ref={fileRef} hidden type="file" accept="image/*,video/*" onChange={(event) => chooseFile(event.target.files?.[0])} />
          {reference ? <div className="reference-chip">{reference.preview ? <img src={reference.preview} alt="已选参考素材" /> : <IconVideo size={21} />}<span>{reference.name}</span><button aria-label="移除参考素材" onClick={() => setReference(null)}><IconX size={15} /></button></div> : <button className="add-reference" onClick={() => fileRef.current?.click()}><IconPlus size={24} /><strong>添加参考</strong><span>图片 / 视频 / 风格</span></button>}
          <div className="prompt-actions"><span>{prompt.length}/1000</span><button className="generate-button" aria-label="开始生成" onClick={submit}><IconArrowUp size={25} /></button></div>
        </div>
      </div>
      <div className="parameter-section">
        <div className="parameter-title"><IconAdjustmentsHorizontal size={17} /><strong>生成参数</strong><span>已按当前模式匹配可用配置</span></div>
        <div className="parameter-grid">
          <ParameterSelect className="model-field" label="模型" value={model} onChange={setModel} ariaLabel="模型选择" options={availableModels.length ? availableModels : [{ value: "", label: "请先配置模型 API" }]} />
          <ParameterSelect label="画幅" value={aspect} onChange={setAspect} ariaLabel="画幅选择" options={["16:9", "9:16", "1:1", "4:3"]} />
          <ParameterSelect label="清晰度" value={resolution} onChange={setResolution} ariaLabel="清晰度选择" options={mode === "video" ? ["1080P", "720P"] : ["2K", "1K"]} />
          {mode === "video" ? <ParameterSelect label="时长" value={duration} onChange={setDuration} ariaLabel="时长选择" options={["5s", "10s", "15s", "30s"]} /> : <ParameterSelect label="数量" value="1 张" ariaLabel="生成数量" options={["1 张", "2 张", "4 张"]} />}
        </div>
        {mode === "video" && <div className="parameter-options"><label><input type="checkbox" checked={sound} onChange={(event) => setSound(event.target.checked)} />生成音频</label><label><input type="checkbox" checked={watermark} onChange={(event) => { setWatermark(event.target.checked); if (!event.target.checked) setWatermarkText(""); }} />添加水印</label>{watermark && <div className="watermark-field"><input autoFocus value={watermarkText} maxLength={20} onChange={(event) => setWatermarkText(event.target.value)} placeholder="输入水印文字" aria-label="水印文字" /><span>{watermarkText.length}/20</span></div>}<span className="cost-estimate">预计消耗 28 创作点 · 约 3–5 分钟</span></div>}
      </div>
      <div className="composer-footer"><div className="trust-row"><span><IconShieldCheck size={15} />模型服务正常</span><span><IconLock size={15} />素材私密处理</span><span><IconEye size={15} />预计消耗实时可见</span></div></div>
    </section>
  );
}

function TaskMiniCard({ task }) {
  return <article className="task-mini"><img src={task.image} alt="" /><div className="task-mini-body"><strong>{task.title}</strong><span>{task.meta}</span>{task.status === "generating" ? <><em>生成中 {task.progress}%</em><div className="progress"><i style={{ width: `${task.progress}%` }} /></div></> : task.status === "done" ? <em className="done">已完成</em> : <><em className="muted">排队中</em><div className="progress"><i style={{ width: "0%" }} /></div></>}</div></article>;
}

function ActiveTasks({ tasks, setView }) {
  return <aside className="active-tasks"><div className="section-heading"><h2>进行中的任务</h2>{tasks.length > 0 && <button onClick={() => setView("tasks")}>全部任务</button>}</div>{tasks.length ? <><div className="task-mini-list">{tasks.slice(0, 5).map((task) => <TaskMiniCard key={task.id} task={task} />)}</div><button className="all-tasks" onClick={() => setView("tasks")}>查看全部任务<IconArrowRight size={18} /></button></> : <div className="compact-empty"><span><IconChecklist size={28} /></span><strong>还没有创作任务</strong><p>完成创意描述并提交后，任务进度会显示在这里。</p><button onClick={() => document.querySelector("textarea")?.focus()}>开始第一次创作</button></div>}</aside>;
}

function RecommendationCard({ item, onSelect }) {
  return <article className="recommendation" tabIndex="0" onClick={() => onSelect(item.prompt)} onKeyDown={(event) => event.key === "Enter" && onSelect(item.prompt)}><div className="thumb"><img src={item.image} alt={item.title} /><span className="play"><IconPlayerPlayFilled size={19} /></span></div><strong>{item.title}</strong><div className="tags">{item.meta.map((tag) => <span key={tag}>{tag}</span>)}</div></article>;
}

function HomeView({ tasks, setTasks, setView, onToast, providers }) {
  const [injectedPrompt, setInjectedPrompt] = useState("");
  const [composerKey, setComposerKey] = useState(0);
  const fillPrompt = (value) => { setInjectedPrompt(value); setComposerKey((key) => key + 1); onToast("创意描述已带入，请继续完善"); window.setTimeout(() => document.querySelector("textarea")?.focus(), 30); };
  const createTask = async ({ prompt, mode, reference, model, aspect, resolution, duration, sound, watermark }) => {
    let referenceAssetId;
    if (reference?.file && !api.isMock) {
      const upload = await api.uploads.createPresignedUpload({ file_name: reference.name, content_type: reference.type, size: reference.file.size });
      const response = await fetch(upload.upload_url, { method: "PUT", headers: upload.headers, body: reference.file });
      if (!response.ok) throw new Error("参考素材上传失败，请重试");
      referenceAssetId = upload.asset_id;
    }
    const task = await api.tasks.create({ prompt, mode, model, aspect, resolution, duration: mode === "video" ? duration : undefined, sound, watermark: watermark || undefined, reference_asset_id: referenceAssetId, estimated_cost: 28 });
    setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]); onToast("任务已提交，可在右侧或任务中心查看进度");
  };
  return <div className="home-view"><section className="hero-copy"><h1>把灵感，变成下一帧。</h1><p>组合文案、图片、音频和参考视频，提交后自动追踪任务进度。</p></section><div className="composer-proxy" data-prefill={injectedPrompt}><ComposerWithInitial key={`${composerKey}-${injectedPrompt}`} initialPrompt={injectedPrompt} onGenerate={createTask} onToast={onToast} providers={providers} /></div><ActiveTasks tasks={tasks} setView={setView} /><section className="recommendations-section"><h2>为你推荐</h2><div className="recommendations-grid">{recommendations.map((item) => <RecommendationCard key={item.title} item={item} onSelect={fillPrompt} />)}</div></section></div>;
}

function ApiConfigDialog({ editingProvider, onClose, onSave, onToast }) {
  const editingVendor = ["火山方舟", "Vidu", "Flux API"].find((item) => editingProvider?.name.startsWith(item)) || "火山方舟";
  const [vendor, setVendor] = useState(editingVendor);
  const [name, setName] = useState(editingProvider ? (editingProvider.name.split(" · ").slice(1).join(" · ") || "默认连接") : "生产环境");
  const [endpoint, setEndpoint] = useState(editingProvider?.endpoint || "ark.cn-beijing.volces.com");
  const [secret, setSecret] = useState("");
  const vendorModels = {
    "火山方舟": [{ name: "Seedance 1.0 Pro", mode: "video" }, { name: "Seedance 1.0 Lite", mode: "video" }, { name: "Seedream 4.0", mode: "image" }],
    Vidu: [{ name: "Vidu Q2 Pro", mode: "video" }],
    "Flux API": [{ name: "Flux 1.1 Pro", mode: "image" }],
  };
  const save = async () => {
    if (!name.trim() || !endpoint.trim() || (!editingProvider && secret.length < 4) || (secret && secret.length < 4)) return onToast(editingProvider ? "请完整填写连接信息，新密钥至少 4 位" : "请完整填写连接名称、地址和密钥");
    try {
      await onSave({ id: editingProvider?.id, name: `${vendor} · ${name.trim()}`, endpoint: endpoint.trim(), api_key: secret || undefined, credential: secret ? `••••••••${secret.slice(-4).toUpperCase()}` : editingProvider?.credential, enabled: editingProvider?.enabled ?? true, models: editingProvider && vendor === editingVendor ? editingProvider.models : vendorModels[vendor] });
      setSecret("");
      onClose();
    } catch (error) { onToast(error.message || "模型 API 保存失败"); }
  };
  return <div className="modal-backdrop"><section className="api-dialog" role="dialog" aria-modal="true" aria-labelledby="api-dialog-title"><div className="api-dialog-head"><div><h2 id="api-dialog-title">{editingProvider ? "编辑模型 API" : "新增模型 API"}</h2><p>{editingProvider ? "可更新连接信息；密钥留空将继续使用服务端已有凭证。" : "凭证一次性提交到服务端密钥库，保存后仅显示末 4 位。"}</p></div><button aria-label="关闭" onClick={onClose}><IconX size={18} /></button></div><div className="api-form"><label><span>服务商</span><span className="select-control"><select value={vendor} onChange={(event) => { const next = event.target.value; setVendor(next); setEndpoint(next === "火山方舟" ? "ark.cn-beijing.volces.com" : next === "Vidu" ? "api.vidu.cn" : "api.bfl.ai"); }}><option>火山方舟</option><option>Vidu</option><option>Flux API</option></select><IconChevronDown size={16} /></span></label><label><span>连接名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：生产环境" /></label><label><span>API 地址</span><input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} /></label><label><span>API 密钥</span><input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder={editingProvider ? "留空则保留现有凭证" : "仅用于演示，请勿输入真实密钥"} autoComplete="off" /></label></div><div className="api-security-note"><IconShieldCheck size={17} /><span>前端不会保存或回显完整密钥；生产环境由服务端加密托管。</span></div><div className="api-dialog-actions"><button onClick={onClose}>取消</button><button className="primary" onClick={save}>{editingProvider ? "保存修改" : "保存并验证"}</button></div></section></div>;
}

function DeleteProviderDialog({ provider, onClose, onConfirm }) {
  return <div className="modal-backdrop"><section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-provider-title"><span className="dialog-icon"><IconTrash size={24} /></span><h2 id="delete-provider-title">删除模型连接？</h2><p>将删除“{provider.name}”的连接记录，首页也会同步移除它提供的模型。此操作不可撤销。</p><div><button onClick={onClose}>取消</button><button className="danger" onClick={onConfirm}>确认删除</button></div></section></div>;
}

function VideoPreviewDialog({ task, onClose }) {
  const duration = Number(task.meta.match(/(\d+)s/)?.[1] || 30);
  const isRealVideo = task.result?.media_type?.startsWith("video/");
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    if (!playing || isRealVideo) return undefined;
    const timer = window.setInterval(() => setCurrentTime((value) => {
      if (value >= duration) { setPlaying(false); return duration; }
      return Math.min(duration, value + 1);
    }), 1000);
    return () => window.clearInterval(timer);
  }, [playing, duration, isRealVideo]);
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const togglePlayback = () => {
    if (currentTime >= duration) setCurrentTime(0);
    setPlaying((value) => !value);
  };
  return <div className="modal-backdrop video-preview-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="video-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="video-preview-title"><header><div><h2 id="video-preview-title">{task.title}</h2><p>{task.meta} · 消耗 {task.cost} 创作点</p></div><button aria-label="关闭播放窗口" onClick={onClose}><IconX size={19} /></button></header>{isRealVideo ? <video className="real-video-player" src={task.result.playback_url} poster={task.result.poster_url || task.image} controls autoPlay playsInline /> : <><div className={`video-stage ${playing ? "playing" : ""}`} style={{ backgroundImage: `url(${task.result?.poster_url || task.image})` }}><button className="video-main-control" aria-label={playing ? "暂停视频" : "播放视频"} onClick={togglePlayback}>{playing ? <IconPlayerPauseFilled size={28} /> : <IconPlayerPlayFilled size={28} />}</button><div className="video-motion-overlay" /></div><footer><button aria-label={playing ? "暂停视频" : "播放视频"} onClick={togglePlayback}>{playing ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}</button><span>{String(Math.floor(currentTime / 60)).padStart(2, "0")}:{String(currentTime % 60).padStart(2, "0")}</span><div className="video-seek"><i style={{ width: `${(currentTime / duration) * 100}%` }} /></div><span>{String(Math.floor(duration / 60)).padStart(2, "0")}:{String(duration % 60).padStart(2, "0")}</span></footer></>}</section></div>;
}

function Pagination({ total, page, onPageChange, pageSize = 4 }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return <div className="pagination" aria-label="分页导航"><span>共 {total} 条</span><div><button disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="上一页"><IconChevronRight size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? "active" : ""} onClick={() => onPageChange(number)}>{number}</button>)}<button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="下一页"><IconChevronRight size={16} /></button></div></div>;
}

function TransactionRecords({ records = transactionRecords }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const visibleRecords = records.slice((page - 1) * pageSize, page * pageSize);
  return (
    <article className="account-panel transaction-panel">
      <div className="transaction-heading">
        <div><h2>交易记录</h2><p>记录创作点的发放、奖励与任务消耗。</p></div>
        <span>最近 30 天</span>
      </div>
      <div className="transaction-table" role="table" aria-label="创作点交易记录">
        <div className="transaction-row transaction-table-head" role="row"><span>时间</span><span>类型</span><span>关联单号 / 任务</span><span>点数变动</span></div>
        {visibleRecords.map((record) => <div className="transaction-row" role="row" key={record.id}><time>{record.occurred_at || record.time}</time><strong className="transaction-type">{record.type}</strong><span className="transaction-reference"><strong>{record.reference}</strong><small>{record.id} · {record.detail}</small></span><strong className={`transaction-amount ${record.amount > 0 ? "credit" : "debit"}`}>{record.amount > 0 ? "+" : ""}{record.amount.toLocaleString()} 点</strong></div>)}
      </div>
      <Pagination total={records.length} page={page} onPageChange={setPage} pageSize={pageSize} />
    </article>
  );
}

function AccountSettings({ setView, onToast, avatarSeed }) {
  const aid = "clzs-7F3A9C2E-20260808";
  const copyValue = async (value, label) => {
    try { await navigator.clipboard.writeText(value); onToast(`${label}已复制`); }
    catch { onToast("浏览器未授权复制，请手动记录"); }
  };
  return (
    <section className="account-settings-view">
      <button className="back-home" onClick={() => setView("account")}><IconChevronRight size={17} />返回用户中心</button>
      <div className="settings-heading"><div><h1>账户设置</h1><p>查看账户基本信息与系统唯一身份标识。</p></div><GeneratedAvatar seed={avatarSeed} className="settings-avatar" /></div>
      <article className="identity-card">
        <div className="identity-card-head"><div><h2>基本信息</h2><p>AID 由系统创建且不可修改，可用于客服核验和数据归属识别。</p></div><span className="identity-status"><IconShieldCheck size={16} />身份已验证</span></div>
        <div className="identity-fields">
          <label><span>姓名</span><div className="identity-value"><strong>林溪</strong></div></label>
          <label className="aid-field"><span>AID · 唯一用户标识</span><div className="identity-value emphasized"><code>{aid}</code><button aria-label="复制 AID" onClick={() => copyValue(aid, "AID")}><IconCopy size={18} />复制</button></div><small>系统唯一生成，不随手机号或昵称变更。</small></label>
          <label><span>手机号码</span><div className="identity-value"><strong>159 0581 8327</strong><button aria-label="复制手机号码" onClick={() => copyValue("15905818327", "手机号")}><IconCopy size={18} /></button></div></label>
        </div>
      </article>
    </section>
  );
}

function AccountCenter({ setView, providers, setProviders, onToast, avatarSeed }) {
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [deletingProvider, setDeletingProvider] = useState(null);
  const toggleProvider = (id) => setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, enabled: !provider.enabled } : provider));
  const openAdd = () => { setEditingProvider(null); setApiDialogOpen(true); };
  const closeApiDialog = () => { setApiDialogOpen(false); setEditingProvider(null); };
  const copyCredential = async (provider) => {
    try { await navigator.clipboard.writeText(provider.credential); onToast("已复制脱敏 Key 标识；完整密钥不会在前端回显"); }
    catch { onToast("浏览器未授权复制，请手动记录脱敏标识"); }
  };
  return <section className="account-view"><div className="account-header"><div><button className="back-home" onClick={() => setView("home")}><IconChevronRight size={17} />返回首页</button><h1>用户中心</h1><p>查看账户信息、套餐用量、交易记录与模型连接。</p></div></div><div className="account-grid"><article className="account-profile-card"><GeneratedAvatar seed={avatarSeed} className="account-avatar" /><div><h2>林溪</h2><p>linxi@example.com</p><span>企业专业版</span></div><button onClick={() => setView("account-settings")}>查看账户</button></article><article className="account-stat"><span>可用创作点</span><strong>12,560</strong><small>本月已使用 3,440</small></article><article className="account-stat"><span>已连接 API</span><strong>{providers.length}</strong><small>{providers.filter((provider) => provider.enabled).length} 个已启用</small></article><article className="account-panel usage-panel"><h2>套餐与用量</h2><div className="usage-row"><span>企业专业版</span><strong>有效期至 2027-08-08</strong></div><div className="usage-track"><i style={{ width: "28%" }} /></div><p>本周期已使用 28% 创作点</p></article><article className="account-panel model-config-panel"><div className="model-config-head"><div><h2>模型 API 配置</h2><p>首页“生成参数”只显示这里已启用连接提供的模型。</p></div><button className="primary-action" onClick={openAdd}><IconPlus size={17} />新增 API</button></div><div className="provider-list">{providers.length ? providers.map((provider) => <div className="provider-row" key={provider.id}><span className={`provider-logo ${provider.enabled ? "enabled" : ""}`}><IconSettings size={20} /></span><div className="provider-main"><strong>{provider.name}</strong><small>{provider.endpoint}</small><div>{provider.models.map((model) => <span key={`${model.mode}-${model.name}`}>{model.name}</span>)}</div></div><div className="provider-secret"><span>凭证</span><strong>{provider.credential}</strong></div><label className="provider-switch"><input type="checkbox" checked={provider.enabled} onChange={() => toggleProvider(provider.id)} /><span>{provider.enabled ? "已启用" : "已停用"}</span></label><div className="provider-actions"><button title="复制脱敏 Key 标识" aria-label={`复制 ${provider.name} Key`} onClick={() => copyCredential(provider)}><IconCopy size={16} /></button><button title="编辑连接" aria-label={`编辑 ${provider.name}`} onClick={() => { setEditingProvider(provider); setApiDialogOpen(true); }}><IconPencil size={16} /></button><button className="delete" title="删除连接" aria-label={`删除 ${provider.name}`} onClick={() => setDeletingProvider(provider)}><IconTrash size={16} /></button></div></div>) : <div className="provider-empty"><span><IconSettings size={28} /></span><strong>尚未连接模型 API</strong><p>连接后，已启用模型会自动出现在首页的生成参数中。</p><button className="primary-action" onClick={openAdd}><IconPlus size={17} />连接第一个 API</button></div>}</div></article><TransactionRecords /></div>{apiDialogOpen && <ApiConfigDialog editingProvider={editingProvider} onClose={closeApiDialog} onToast={onToast} onSave={(provider) => { setProviders((current) => editingProvider ? current.map((item) => item.id === provider.id ? provider : item) : [...current, provider]); onToast(editingProvider ? "模型 API 配置已更新" : "模型 API 已连接，首页模型列表已更新"); }} />}{deletingProvider && <DeleteProviderDialog provider={deletingProvider} onClose={() => setDeletingProvider(null)} onConfirm={() => { setProviders((current) => current.filter((provider) => provider.id !== deletingProvider.id)); setDeletingProvider(null); onToast("模型连接已删除，首页模型列表已同步更新"); }} />}</section>;
}

function SettingsHub({ setView, providers, setProviders, onToast, avatarSeed, account, wallet, transactions }) {
  const [section, setSection] = useState("account");
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [deletingProvider, setDeletingProvider] = useState(null);
  const aid = account.aid;
  const openAdd = () => { setEditingProvider(null); setApiDialogOpen(true); };
  const closeApiDialog = () => { setApiDialogOpen(false); setEditingProvider(null); };
  const copyValue = async (value, label) => {
    try { await navigator.clipboard.writeText(value); onToast(`${label}已复制`); }
    catch { onToast("浏览器未授权复制，请手动记录"); }
  };
  const toggleProvider = async (id) => {
    const currentProvider = providers.find((provider) => provider.id === id);
    const enabled = !currentProvider.enabled;
    setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, enabled } : provider));
    try { await api.providers.update(id, { enabled }); }
    catch (error) { setProviders((current) => current.map((provider) => provider.id === id ? currentProvider : provider)); onToast(error.message); }
  };
  const navigation = [
    { id: "account", label: "账户", icon: IconUserCircle },
    { id: "balance", label: "余额", icon: IconCoin },
    { id: "api", label: "API Keys", icon: IconSettings },
  ];
  return (
    <section className="settings-hub-view">
      <button className="back-home" onClick={() => setView("home")}><IconChevronRight size={17} />返回首页</button>
      <div className="settings-layout">
        <aside className="settings-sidebar" aria-label="用户中心导航"><h1>设置</h1><nav>{navigation.map((item) => { const NavIcon = item.icon; return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}><NavIcon size={20} />{item.label}</button>; })}</nav></aside>
        <main className="settings-main">
          {section === "account" && <><div className="settings-page-title"><div><h2>账户设置</h2><p>查看账户基本信息与系统唯一身份标识。</p></div><GeneratedAvatar seed={avatarSeed} className="settings-avatar" /></div><article className="identity-card"><div className="identity-card-head"><div><h2>基本信息</h2><p>AID 由系统创建且不可修改，可用于客服核验和数据归属识别。</p></div><span className="identity-status"><IconShieldCheck size={16} />身份已验证</span></div><div className="identity-fields"><label><span>姓名</span><div className="identity-value"><strong>{account.name}</strong></div></label><label><span>手机号码</span><div className="identity-value"><strong>{account.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3")}</strong><button aria-label="复制手机号码" onClick={() => copyValue(account.phone, "手机号")}><IconCopy size={18} /></button></div></label><label className="aid-field"><span>AID · 唯一用户标识</span><div className="identity-value emphasized"><code>{aid}</code><button aria-label="复制 AID" onClick={() => copyValue(aid, "AID")}><IconCopy size={18} />复制</button></div><small>系统唯一生成，不随手机号或昵称变更。</small></label></div></article></>}
          {section === "balance" && <><div className="settings-page-title"><div><h2>余额</h2><p>查看创作点余额、套餐用量与交易明细。</p></div></div><div className="balance-grid"><article className="account-stat"><span>可用创作点</span><strong>{wallet.available.toLocaleString()}</strong><small>本月已使用 {wallet.used_this_month.toLocaleString()}</small></article><article className="account-panel usage-panel"><h2>套餐与用量</h2><div className="usage-track"><i style={{ width: `${wallet.usage_percent}%` }} /></div><p>本周期已使用 {wallet.usage_percent}% 创作点</p></article></div><TransactionRecords records={transactions} /></>}
          {section === "api" && <><div className="settings-page-title"><div><h2>API Keys</h2><p>连接并管理生成模型服务，完整密钥不会在前端回显。</p></div><button className="primary-action settings-add-api" onClick={openAdd}><IconPlus size={17} />新增 API</button></div><article className="account-panel model-config-panel settings-api-panel"><div className="model-config-head"><div><h2>模型 API 配置</h2><p>首页“生成参数”只显示已启用连接提供的模型。</p></div></div><div className="provider-list">{providers.length ? providers.map((provider) => <div className="provider-row" key={provider.id}><span className={`provider-logo ${provider.enabled ? "enabled" : ""}`}><IconSettings size={20} /></span><div className="provider-main"><strong>{provider.name}</strong><small>{provider.endpoint}</small><div>{provider.models.map((model) => <span key={`${model.mode}-${model.name}`}>{model.name}</span>)}</div></div><div className="provider-secret"><span>凭证</span><strong>{provider.credential}</strong></div><label className="provider-switch"><input type="checkbox" checked={provider.enabled} onChange={() => toggleProvider(provider.id)} /><span>{provider.enabled ? "已启用" : "已停用"}</span></label><div className="provider-actions"><button title="复制脱敏 Key 标识" aria-label={`复制 ${provider.name} Key`} onClick={() => copyValue(provider.credential, "脱敏 Key 标识")}><IconCopy size={16} /></button><button title="编辑连接" aria-label={`编辑 ${provider.name}`} onClick={() => { setEditingProvider(provider); setApiDialogOpen(true); }}><IconPencil size={16} /></button><button className="delete" title="删除连接" aria-label={`删除 ${provider.name}`} onClick={() => setDeletingProvider(provider)}><IconTrash size={16} /></button></div></div>) : <div className="provider-empty"><span><IconSettings size={28} /></span><strong>尚未连接模型 API</strong><p>连接后，已启用模型会自动出现在首页的生成参数中。</p><button className="primary-action" onClick={openAdd}><IconPlus size={17} />连接第一个 API</button></div>}</div></article></>}
        </main>
      </div>
      {apiDialogOpen && <ApiConfigDialog editingProvider={editingProvider} onClose={closeApiDialog} onToast={onToast} onSave={async (provider) => { const saved = editingProvider ? await api.providers.update(editingProvider.id, provider) : await api.providers.create(provider); setProviders((current) => editingProvider ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); onToast(editingProvider ? "模型 API 配置已更新" : "模型 API 已连接，首页模型列表已更新"); }} />}
      {deletingProvider && <DeleteProviderDialog provider={deletingProvider} onClose={() => setDeletingProvider(null)} onConfirm={async () => { try { await api.providers.remove(deletingProvider.id); setProviders((current) => current.filter((provider) => provider.id !== deletingProvider.id)); setDeletingProvider(null); onToast("模型连接已删除，首页模型列表已同步更新"); } catch (error) { onToast(error.message); } }} />}
    </section>
  );
}

function LoginScreen({ onLogin, onToast }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (!countdown) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);
  const validPhone = /^1\d{10}$/.test(phone);
  const sendCode = async () => {
    if (!validPhone) return onToast("请输入正确的 11 位手机号");
    try { await api.auth.sendSmsCode({ phone, scene: "login" }); setCountdown(60); onToast(api.isMock ? "验证码已发送，Mock 模式可输入任意 6 位数字" : "验证码已发送"); }
    catch (error) { onToast(error.message); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!validPhone) return onToast("请输入正确的 11 位手机号");
    if (!/^\d{6}$/.test(code)) return onToast("请输入 6 位验证码");
    if (!agreed) return onToast("请先阅读并同意服务协议与隐私政策");
    try { const session = await api.auth.login({ phone, code }); onLogin(session); }
    catch (error) { onToast(error.message); }
  };
  return <main className="login-view"><header className="login-brand"><Brand /></header><section className="login-card"><div className="login-heading"><span className="login-icon"><IconPhone size={25} /></span><h1>欢迎使用策量智算</h1><p>使用手机号快捷登录，继续你的 AI 创作。</p></div><form className="login-form" onSubmit={submit}><label><span>手机号</span><div className="phone-input"><strong>+86</strong><input inputMode="numeric" autoComplete="tel" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="请输入手机号" aria-label="手机号" /></div></label><label><span>短信验证码</span><div className="code-input"><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="请输入 6 位验证码" aria-label="短信验证码" /><button type="button" disabled={countdown > 0} onClick={sendCode}>{countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}</button></div></label><label className="agreement"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已阅读并同意<a href="#terms">《服务协议》</a>和<a href="#privacy">《隐私政策》</a></span></label><button className="login-submit" type="submit">登录 / 注册<IconArrowRight size={18} /></button></form><div className="login-security"><IconShieldCheck size={17} /><span>验证码仅用于身份验证，新手机号将自动创建账户。</span></div></section><footer className="login-footer">© 2026 策量智算 · VIDEO STUDIO</footer></main>;
}

function LogoutDialog({ onClose, onConfirm }) {
  return <div className="modal-backdrop"><section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title"><span className="dialog-icon"><IconLogout size={24} /></span><h2 id="logout-title">确认退出登录？</h2><p>退出后，本机未提交的创作内容不会保留。</p><div><button onClick={onClose}>取消</button><button className="danger" onClick={onConfirm}>退出登录</button></div></section></div>;
}

function TaskCenter({ tasks, setTasks, setView, onToast }) {
  const [filter, setFilter] = useState("all"); const [query, setQuery] = useState("");
  const filtered = useMemo(() => tasks.filter((task) => (filter === "all" || task.status === filter) && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const statusText = { generating: "生成中", queued: "排队中", done: "已完成" };
  const deleteTask = async (id) => { try { await api.tasks.remove(id); setTasks((current) => current.filter((task) => task.id !== id)); onToast("任务已移除"); } catch (error) { onToast(error.message); } };
  const openPreview = async (task) => {
    if (task.status !== "done") return onToast("任务完成后即可播放预览");
    try { const result = await api.tasks.getResult(task.id); setPreviewTask({ ...task, result }); }
    catch (error) { onToast(error.message || "播放地址获取失败"); }
  };
  return <section className="task-center-view"><div className="task-center-header"><div><button className="back-home" onClick={() => setView("home")}><IconChevronRight size={17} />返回首页</button><h1>任务中心</h1><p>集中查看生成进度、结果与历史记录。</p></div><button className="primary-action" onClick={() => setView("home")}><IconPlus size={18} />新建创作</button></div><div className="task-toolbar"><div className="filters">{[["all", "全部"], ["generating", "生成中"], ["queued", "排队中"], ["done", "已完成"]].map(([value, label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}<span>{value === "all" ? tasks.length : tasks.filter((task) => task.status === value).length}</span></button>)}</div><label className="search"><IconSearch size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务" /></label></div><div className="task-table"><div className="task-table-head"><span>任务</span><span>状态</span><span>消耗点数</span><span>创建时间</span><span>操作</span></div>{filtered.length ? filtered.map((task) => <article className="task-row" key={task.id}><div className="task-info"><img src={task.image} alt="" /><span><strong>{task.title}</strong><small>{task.meta}</small></span></div><div className="task-status"><span className={`status-pill ${task.status}`}>{task.status === "generating" && <IconRefresh className="spin" size={14} />}{task.status === "queued" && <IconClock size={14} />}{task.status === "done" && <IconCheck size={14} />}{statusText[task.status]}{task.status === "generating" ? ` ${task.progress}%` : ""}</span>{task.status === "generating" && <div className="table-progress"><i style={{ width: `${task.progress}%` }} /></div>}</div><span className="task-cost"><IconCoin size={15} />{task.cost ?? "—"}</span><span className="created-time">{task.created}</span><div className="row-actions">{task.status === "done" ? <button title="下载"><IconDownload size={18} /></button> : <button title="复制任务" onClick={() => onToast("任务参数已复制")}><IconCopy size={18} /></button>}<button title="删除" onClick={() => deleteTask(task.id)}><IconTrash size={18} /></button></div></article>) : <div className="empty-state"><span className="empty-icon"><IconChecklist size={32} /></span><strong>{tasks.length ? "没有匹配的任务" : "还没有创作任务"}</strong><span>{tasks.length ? "换个筛选条件，或清除搜索内容后再试。" : "提交第一个创作后，可以在这里追踪进度和结果。"}</span><button className="empty-action" onClick={() => tasks.length ? (setFilter("all"), setQuery("")) : setView("home")}>{tasks.length ? "清除筛选" : "开始第一次创作"}</button></div>}</div></section>;
}

function TaskCenterV2({ tasks, setTasks, setView, onToast }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [previewTask, setPreviewTask] = useState(null);
  const pageSize = 4;
  const filtered = useMemo(() => tasks.filter((task) => (filter === "all" || task.status === filter) && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const visibleTasks = filtered.slice((page - 1) * pageSize, page * pageSize);
  const statusText = { generating: "生成中", queued: "排队中", done: "已完成" };
  useEffect(() => setPage(1), [filter, query]);
  const deleteTask = async (id) => { try { await api.tasks.remove(id); setTasks((current) => current.filter((task) => task.id !== id)); onToast("任务已移除"); } catch (error) { onToast(error.message); } };
  const openPreview = async (task) => {
    if (task.status !== "done") return onToast("任务完成后即可播放预览");
    try { const result = await api.tasks.getResult(task.id); setPreviewTask({ ...task, result }); }
    catch (error) { onToast(error.message || "播放地址获取失败"); }
  };
  return (
    <section className="task-center-view">
      <div className="task-center-header"><div><h1>任务中心</h1><p>集中查看生成进度、结果与历史记录。</p></div><button className="primary-action" onClick={() => setView("home")}><IconPlus size={18} />新建创作</button></div>
      <div className="task-toolbar"><div className="filters">{[["all", "全部"], ["generating", "生成中"], ["queued", "排队中"], ["done", "已完成"]].map(([value, label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}<span>{value === "all" ? tasks.length : tasks.filter((task) => task.status === value).length}</span></button>)}</div><label className="search"><IconSearch size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务" /></label></div>
      <div className="task-table">
        <div className="task-table-head"><span>任务</span><span>状态</span><span>消耗点数</span><span>创建时间</span><span>操作</span></div>
        {visibleTasks.length ? visibleTasks.map((task) => <article className="task-row" key={task.id}><div className="task-info"><div className="task-thumb"><img src={task.image} alt="" /><button className={task.status === "done" ? "" : "pending"} aria-label={`播放 ${task.title}`} onClick={() => openPreview(task)}><IconPlayerPlayFilled size={17} /></button></div><span><strong>{task.title}</strong><small>{task.meta}</small></span></div><div className="task-status"><span className={`status-pill ${task.status}`}>{task.status === "generating" && <IconRefresh className="spin" size={14} />}{task.status === "queued" && <IconClock size={14} />}{task.status === "done" && <IconCheck size={14} />}{statusText[task.status]}{task.status === "generating" ? ` ${task.progress}%` : ""}</span>{task.status === "generating" && <div className="table-progress"><i style={{ width: `${task.progress}%` }} /></div>}</div><span className="task-cost"><IconCoin size={15} />{task.cost ?? "—"}</span><span className="created-time">{task.created}</span><div className="row-actions">{task.status === "done" ? <button title="下载"><IconDownload size={18} /></button> : <button title="复制任务" onClick={() => onToast("任务参数已复制")}><IconCopy size={18} /></button>}<button title="删除" onClick={() => deleteTask(task.id)}><IconTrash size={18} /></button></div></article>) : <div className="empty-state"><span className="empty-icon"><IconChecklist size={32} /></span><strong>{tasks.length ? "没有匹配的任务" : "还没有创作任务"}</strong><span>{tasks.length ? "换个筛选条件，或清除搜索内容后再试。" : "提交第一个创作后，可以在这里追踪进度和结果。"}</span><button className="empty-action" onClick={() => tasks.length ? (setFilter("all"), setQuery("")) : setView("home")}>{tasks.length ? "清除筛选" : "开始第一次创作"}</button></div>}
        <Pagination total={filtered.length} page={page} onPageChange={setPage} pageSize={pageSize} />
      </div>
      {previewTask && <VideoPreviewDialog task={previewTask} onClose={() => setPreviewTask(null)} />}
    </section>
  );
}

export function App() {
  const previewParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const emptyPreview = previewParams.get("state") === "empty";
  const [view, setView] = useState("home");
  const [tasks, setTasks] = useState(emptyPreview ? [] : api.isMock ? initialTasks : []);
  const [providers, setProviders] = useState(emptyPreview ? [] : api.isMock ? initialProviders : []);
  const [account, setAccount] = useState({ aid: "—", name: "", phone: "", email: "", avatar_seed: 0 });
  const [wallet, setWallet] = useState({ available: 0, used_this_month: 0, usage_percent: 0 });
  const [transactions, setTransactions] = useState(emptyPreview ? [] : transactionRecords);
  const [toast, setToast] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(api.isMock && previewParams.get("screen") !== "login");
  const [avatarSeed, setAvatarSeed] = useState(createBackendAvatarSeed);
  const [syncNonce, setSyncNonce] = useState(0);
  const showToast = (message) => { const tone = /请|先写下|失败|未授权/.test(message) ? "warning" : "success"; setToast({ message, tone }); window.clearTimeout(window.__toastTimer); window.__toastTimer = window.setTimeout(() => setToast(null), 2600); };
  useEffect(() => {
    if (api.isMock || previewParams.get("screen") === "login") return;
    api.auth.refresh().then((session) => { setAccount(session.user); setAvatarSeed(session.user.avatar_seed ?? 0); setAuthenticated(true); }).catch(() => setAuthenticated(false));
  }, [previewParams]);
  useEffect(() => {
    if (!authenticated || emptyPreview) return undefined;
    let cancelled = false;
    const sync = async () => {
      try {
        const [taskPage, providerPage, accountData, walletData, transactionPage] = await Promise.all([api.tasks.list({ pageSize: 100 }), api.providers.list(), api.account.get(), api.wallet.get(), api.wallet.listTransactions({ pageSize: 100 })]);
        if (cancelled) return;
        setTasks(taskPage.items); setProviders(providerPage.items); setAccount(accountData); setWallet(walletData); setTransactions(transactionPage.items); setAvatarSeed(accountData.avatar_seed ?? 0);
      } catch (error) { if (!cancelled) showToast(error.message || "数据同步失败"); }
    };
    sync();
    const timer = window.setInterval(sync, 4000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [authenticated, emptyPreview, syncNonce]);
  const confirmLogout = async () => { try { await api.auth.logout(); } finally { setLogoutOpen(false); setAuthenticated(false); } };
  return <div className="app-shell">{authenticated ? <div className="app-content"><Topbar view={view} setView={setView} onAccount={() => setView("account")} onAccountSettings={() => setView("account")} onLogout={() => setLogoutOpen(true)} avatarSeed={avatarSeed} credits={wallet.available} />{view === "home" ? <HomeView tasks={tasks} setTasks={setTasks} setView={setView} onToast={showToast} providers={providers} /> : view === "tasks" ? <TaskCenterV2 tasks={tasks} setTasks={setTasks} setView={setView} onToast={showToast} /> : <SettingsHub setView={setView} providers={providers} setProviders={setProviders} onToast={showToast} avatarSeed={avatarSeed} account={account} wallet={wallet} transactions={transactions} />}</div> : <LoginScreen onToast={showToast} onLogin={(session) => { setAccount(session.user); setAvatarSeed(session.user.avatar_seed ?? createBackendAvatarSeed()); setAuthenticated(true); setSyncNonce((value) => value + 1); setView("home"); showToast("登录成功"); }} />}<div className={`toast ${toast ? "show" : ""} ${toast?.tone || ""}`} role="status">{toast?.tone === "warning" ? <IconAlertCircle size={18} /> : <IconCheck size={18} />}{toast?.message || ""}</div>{logoutOpen && <LogoutDialog onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}</div>;
}
