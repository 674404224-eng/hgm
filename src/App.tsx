import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "./api";
import { useAccountQuery, useCreateTaskMutation, useDeleteTaskMutation, useModelsQuery, useTasksQuery, useTransactionsQuery, useWalletQuery } from "./api/hooks";
import { LoginScreen } from "./features/auth/LoginScreen";
import type { Account, Model, Task, Transaction, Wallet } from "./types/domain";
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
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
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
  { id: "task-1", title: "新品发布宣传片", meta: "16:9 · 1080P · 30s", cost: 32, status: "done", progress: 100, image: assets.city, created: "刚刚" },
  { id: "task-2", title: "产品功能演示", meta: "16:9 · 720P · 20s", cost: 18, status: "queued", progress: 0, image: assets.product, created: "2 分钟前" },
  { id: "task-3", title: "品牌故事短片", meta: "16:9 · 1080P · 45s", cost: 45, status: "generating", progress: 32, image: assets.mountain, created: "5 分钟前" },
  { id: "task-4", title: "社媒推广视频", meta: "9:16 · 720P · 15s", cost: 16, status: "queued", progress: 0, image: assets.interior, created: "8 分钟前" },
  { id: "task-5", title: "节日促销海报视频", meta: "1:1 · 1080P · 10s", cost: 14, status: "queued", progress: 0, image: assets.interior, created: "12 分钟前" },
] satisfies Task[];

const initialModels = [
  { id: "seedance-1-0-pro", name: "Seedance 1.0 Pro", provider_name: "火山方舟", mode: "video", status: "available", base_points: 28, capabilities: { aspects: ["16:9", "9:16", "1:1"], resolutions: ["1080P", "720P"], durations: [5, 10, 15, 30], sound: true, watermark: true } },
  { id: "seedance-1-0-lite", name: "Seedance 1.0 Lite", provider_name: "火山方舟", mode: "video", status: "available", base_points: 18, capabilities: { aspects: ["16:9", "9:16", "1:1"], resolutions: ["720P"], durations: [5, 10], sound: false, watermark: true } },
  { id: "vidu-q2-pro", name: "Vidu Q2 Pro", provider_name: "Vidu", mode: "video", status: "available", base_points: 24, capabilities: { aspects: ["16:9", "9:16"], resolutions: ["1080P", "720P"], durations: [5, 10, 15], sound: true, watermark: false } },
  { id: "seedream-4-0", name: "Seedream 4.0", provider_name: "火山方舟", mode: "image", status: "available", base_points: 12, capabilities: { aspects: ["1:1", "16:9", "9:16", "4:3"], resolutions: ["2K", "1K"], counts: [1, 2, 4] } },
  { id: "seedream-3-0", name: "Seedream 3.0", provider_name: "火山方舟", mode: "image", status: "available", base_points: 8, capabilities: { aspects: ["1:1", "16:9", "4:3"], resolutions: ["1K"], counts: [1, 2] } },
  { id: "flux-1-1-pro", name: "Flux 1.1 Pro", provider_name: "Flux", mode: "image", status: "maintenance", base_points: 14, capabilities: { aspects: ["1:1", "16:9", "9:16"], resolutions: ["2K", "1K"], counts: [1] } },
] satisfies Model[];

const transactionRecords = [
  { id: "TX-20260808-001", occurred_at: "2026-08-08 14:32", type: "任务消耗", reference: "新品发布宣传片", detail: "Seedance 1.0 Pro", amount: -32 },
  { id: "TX-20260801-001", occurred_at: "2026-08-01 09:00", type: "套餐发放", reference: "企业专业版月度额度", detail: "有效期至 2026-08-31", amount: 16000 },
  { id: "TX-20260728-115", occurred_at: "2026-07-28 16:15", type: "任务消耗", reference: "品牌故事短片", detail: "Seedance 1.0 Pro", amount: -45 },
  { id: "TX-20260720-006", occurred_at: "2026-07-20 11:20", type: "活动奖励", reference: "夏季创作活动", detail: "奖励已到账", amount: 500 },
  { id: "TX-20260718-103", occurred_at: "2026-07-18 18:06", type: "任务消耗", reference: "产品功能演示", detail: "Vidu Q2 Pro", amount: -18 },
] satisfies Transaction[];

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

function Topbar({ view, setView, onAccount, onAccountSettings, onBalance, onLogout, avatarSeed, credits = 0 }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <Brand />
      <nav className="top-nav" aria-label="主导航">
        <button className={view === "home" ? "active" : ""} onClick={() => { setView("home"); setOpen(false); }}><IconHome size={18} />首页</button>
        <button className={view === "tasks" ? "active" : ""} onClick={() => { setView("tasks"); setOpen(false); }}><IconChecklist size={18} />任务中心</button>
      </nav>
      <div className="topbar-spacer" />
      <button className="credits" onClick={() => { onBalance(); setOpen(false); }}><IconCoin size={18} fill="currentColor" /><span>创作点</span><strong>{credits.toLocaleString()}</strong></button>
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

function ComposerWithInitial({ initialPrompt, onGenerate, onToast, models }) {
  const [mode, setMode] = useState<"video" | "image">("video");
  const [modelId, setModelId] = useState("seedance-1-0-pro");
  const [aspect, setAspect] = useState("16:9");
  const [resolution, setResolution] = useState("1080P");
  const [duration, setDuration] = useState("10s");
  const [count, setCount] = useState(1);
  const [sound, setSound] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [reference, setReference] = useState<{ name: string; type: string; file: File; preview: string | null } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const availableModels = useMemo(() => models.filter((item) => item.status === "available" && item.mode === mode).map((item) => ({ value: item.id, label: `${item.name} · ${item.provider_name}` })), [mode, models]);
  const selectedModel = models.find((item) => item.id === modelId);
  const capabilities = selectedModel?.capabilities || {};
  const aspectOptions = capabilities.aspects?.length ? capabilities.aspects : ["16:9", "9:16", "1:1", "4:3"];
  const resolutionOptions = capabilities.resolutions?.length ? capabilities.resolutions : mode === "video" ? ["1080P", "720P"] : ["2K", "1K"];
  const durationOptions = capabilities.durations?.length ? capabilities.durations.map((item) => `${item}s`) : ["5s", "10s", "15s", "30s"];
  const countOptions = capabilities.counts?.length ? capabilities.counts : [1, 2, 4];
  const estimatedPoints = (selectedModel?.base_points ?? 28) * (mode === "image" ? count : 1);

  useEffect(() => {
    setModelId(availableModels[0]?.value || "");
    if (mode === "video") { setAspect("16:9"); setResolution("1080P"); }
    else { setAspect("1:1"); setResolution("2K"); }
  }, [mode, availableModels]);

  useEffect(() => {
    if (!selectedModel) return;
    if (!aspectOptions.includes(aspect)) setAspect(aspectOptions[0]);
    if (!resolutionOptions.includes(resolution)) setResolution(resolutionOptions[0]);
    if (mode === "video" && !durationOptions.includes(duration)) setDuration(durationOptions[0]);
    if (mode === "image" && !countOptions.includes(count)) setCount(countOptions[0]);
    if (!capabilities.sound) setSound(false);
    if (!capabilities.watermark) { setWatermark(false); setWatermarkText(""); }
  }, [selectedModel, mode]);

  const chooseFile = (file) => {
    if (!file) return;
    setReference({ name: file.name, type: file.type, file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
    onToast("参考素材已添加，仅用于本次任务");
  };

  const submit = async () => {
    if (!prompt.trim()) return onToast("先写下你的创意，再开始生成");
    if (!modelId) return onToast("当前暂无可用模型，请稍后再试");
    if (watermark && !watermarkText.trim()) return onToast("请输入水印文字，或关闭水印");
    try {
      await onGenerate({ prompt, mode, reference, modelId, aspect, resolution, duration, count, sound, watermark: watermark ? watermarkText.trim() : "", maxPoints: estimatedPoints });
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
        <div className="parameter-title"><IconAdjustmentsHorizontal size={17} /><strong>生成参数</strong><span>模型由平台统一提供与维护</span></div>
        <div className="parameter-grid">
          <ParameterSelect className="model-field" label="模型" value={modelId} onChange={setModelId} ariaLabel="模型选择" options={availableModels.length ? availableModels : [{ value: "", label: "暂无可用模型" }]} />
          <ParameterSelect label="画幅" value={aspect} onChange={setAspect} ariaLabel="画幅选择" options={aspectOptions} />
          <ParameterSelect label="清晰度" value={resolution} onChange={setResolution} ariaLabel="清晰度选择" options={resolutionOptions} />
          {mode === "video" ? <ParameterSelect label="时长" value={duration} onChange={setDuration} ariaLabel="时长选择" options={durationOptions} /> : <ParameterSelect label="数量" value={String(count)} onChange={(value) => setCount(Number(value))} ariaLabel="生成数量" options={countOptions.map((item) => ({ value: String(item), label: `${item} 张` }))} />}
        </div>
        <div className="parameter-options">{mode === "video" && <><label className={!capabilities.sound ? "option-disabled" : ""}><input type="checkbox" checked={sound} disabled={!capabilities.sound} onChange={(event) => setSound(event.target.checked)} />生成音频</label><label className={!capabilities.watermark ? "option-disabled" : ""}><input type="checkbox" checked={watermark} disabled={!capabilities.watermark} onChange={(event) => { setWatermark(event.target.checked); if (!event.target.checked) setWatermarkText(""); }} />添加水印</label>{watermark && <div className="watermark-field"><input autoFocus value={watermarkText} maxLength={20} onChange={(event) => setWatermarkText(event.target.value)} placeholder="输入水印文字" aria-label="水印文字" /><span>{watermarkText.length}/20</span></div>}</>}<span className="cost-estimate">预计消耗 {estimatedPoints} 创作点 · 约 3–5 分钟</span></div>
      </div>
      <div className="composer-footer"><div className="trust-row"><span><IconShieldCheck size={15} />平台模型统一托管</span><span><IconLock size={15} />素材私密处理</span><span><IconEye size={15} />预计消耗实时可见</span></div></div>
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
  return <article className="recommendation" tabIndex={0} onClick={() => onSelect(item.prompt)} onKeyDown={(event) => event.key === "Enter" && onSelect(item.prompt)}><div className="thumb"><img src={item.image} alt={item.title} /><span className="play"><IconPlayerPlayFilled size={19} /></span></div><strong>{item.title}</strong><div className="tags">{item.meta.map((tag) => <span key={tag}>{tag}</span>)}</div></article>;
}

function HomeView({ tasks, setTasks, setView, onToast, models }) {
  const [injectedPrompt, setInjectedPrompt] = useState("");
  const [composerKey, setComposerKey] = useState(0);
  const createTaskMutation = useCreateTaskMutation();
  const fillPrompt = (value) => { setInjectedPrompt(value); setComposerKey((key) => key + 1); onToast("创意描述已带入，请继续完善"); window.setTimeout(() => document.querySelector("textarea")?.focus(), 30); };
  const createTask = async ({ prompt, mode, reference, modelId, aspect, resolution, duration, count, sound, watermark, maxPoints }) => {
    let referenceAssetId;
    if (reference?.file && !api.isMock) {
      const upload = await api.uploads.createPresignedUpload({ file_name: reference.name, content_type: reference.type, size: reference.file.size });
      const response = await fetch(upload.upload_url, { method: "PUT", headers: upload.headers, body: reference.file });
      if (!response.ok) throw new Error("参考素材上传失败，请重试");
      referenceAssetId = upload.asset_id;
    }
    const task = await createTaskMutation.mutateAsync({ prompt, mode, model_id: modelId, aspect, resolution, duration: mode === "video" ? duration : undefined, count: mode === "image" ? count : undefined, sound: mode === "video" ? sound : undefined, watermark: watermark || undefined, reference_asset_id: referenceAssetId, max_points: maxPoints });
    setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]); onToast("任务已提交，可在右侧或任务中心查看进度");
  };
  return <div className="home-view"><section className="hero-copy"><h1>把灵感，变成下一帧。</h1><p>组合文案、图片、音频和参考视频，提交后自动追踪任务进度。</p></section><div className="composer-proxy" data-prefill={injectedPrompt}><ComposerWithInitial key={`${composerKey}-${injectedPrompt}`} initialPrompt={injectedPrompt} onGenerate={createTask} onToast={onToast} models={models} /></div><ActiveTasks tasks={tasks} setView={setView} /><section className="recommendations-section"><h2>为你推荐</h2><div className="recommendations-grid">{recommendations.map((item) => <RecommendationCard key={item.title} item={item} onSelect={fillPrompt} />)}</div></section></div>;
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
        {visibleRecords.map((record) => <div className="transaction-row" role="row" key={record.id}><time>{record.occurred_at}</time><strong className="transaction-type">{record.type}</strong><span className="transaction-reference"><strong>{record.reference}</strong><small>{record.id} · {record.detail}</small></span><strong className={`transaction-amount ${record.amount > 0 ? "credit" : "debit"}`}>{record.amount > 0 ? "+" : ""}{record.amount.toLocaleString()} 点</strong></div>)}
      </div>
      <Pagination total={records.length} page={page} onPageChange={setPage} pageSize={pageSize} />
    </article>
  );
}

function SettingsHub({ setView, onToast, avatarSeed, account, wallet, transactions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.endsWith("/balance") ? "balance" : "account";
  const aid = account.aid;
  const copyValue = async (value, label) => {
    try { await navigator.clipboard.writeText(value); onToast(`${label}已复制`); }
    catch { onToast("浏览器未授权复制，请手动记录"); }
  };
  const navigation = [
    { id: "account", label: "账户", icon: IconUserCircle },
    { id: "balance", label: "余额", icon: IconCoin },
  ];
  return (
    <section className="settings-hub-view">
      <div className="settings-layout">
        <aside className="settings-sidebar" aria-label="用户中心导航"><h1>设置</h1><nav>{navigation.map((item) => { const NavIcon = item.icon; return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => navigate(`/settings/${item.id}`)}><NavIcon size={20} />{item.label}</button>; })}</nav></aside>
        <main className="settings-main">
          {section === "account" && <><div className="settings-page-title"><div><h2>账户设置</h2><p>查看账户基本信息与系统唯一身份标识。</p></div><GeneratedAvatar seed={avatarSeed} className="settings-avatar" /></div><article className="identity-card"><div className="identity-card-head"><div><h2>基本信息</h2><p>AID 由系统创建且不可修改，可用于客服核验和数据归属识别。</p></div><span className="identity-status"><IconShieldCheck size={16} />身份已验证</span></div><div className="identity-fields"><label><span>姓名</span><div className="identity-value"><strong>{account.name}</strong></div></label><label><span>手机号码</span><div className="identity-value"><strong>{account.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3")}</strong><button aria-label="复制手机号码" onClick={() => copyValue(account.phone, "手机号")}><IconCopy size={18} /></button></div></label><label className="aid-field"><span>AID · 唯一用户标识</span><div className="identity-value emphasized"><code>{aid}</code><button aria-label="复制 AID" onClick={() => copyValue(aid, "AID")}><IconCopy size={18} />复制</button></div><small>系统唯一生成，不随手机号或昵称变更。</small></label></div></article></>}
          {section === "balance" && <><div className="settings-page-title"><div><h2>余额</h2><p>查看创作点余额、用量与交易明细。</p></div></div><div className="balance-grid"><article className="account-stat"><span>可用创作点</span><strong>{wallet.available.toLocaleString()}</strong><small>本月已使用 {wallet.used_this_month.toLocaleString()}</small></article><article className="account-panel usage-panel"><h2>本期用量</h2><div className="usage-track"><i style={{ width: `${wallet.usage_percent}%` }} /></div><p>本周期已使用 {wallet.usage_percent}% 创作点</p></article></div><article className="platform-billing-note"><span><IconShieldCheck size={22} /></span><div><strong>平台统一提供模型服务</strong><p>无需配置外部 API Key；创作点包含模型调用、智能处理与结果存储服务。</p></div></article><TransactionRecords records={transactions} /></>}
        </main>
      </div>
    </section>
  );
}

function LogoutDialog({ onClose, onConfirm }) {
  return <div className="modal-backdrop"><section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title"><span className="dialog-icon"><IconLogout size={24} /></span><h2 id="logout-title">确认退出登录？</h2><p>退出后，本机未提交的创作内容不会保留。</p><div><button onClick={onClose}>取消</button><button className="danger" onClick={onConfirm}>退出登录</button></div></section></div>;
}

function TaskCenterV2({ tasks, setTasks, setView, onToast }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [previewTask, setPreviewTask] = useState(null);
  const deleteTaskMutation = useDeleteTaskMutation();
  const pageSize = 4;
  const filtered = useMemo(() => tasks.filter((task) => (filter === "all" || task.status === filter) && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const visibleTasks = filtered.slice((page - 1) * pageSize, page * pageSize);
  const statusText = { generating: "生成中", queued: "排队中", done: "已完成", failed: "失败", cancelled: "已取消" };
  useEffect(() => setPage(1), [filter, query]);
  const deleteTask = async (id) => { try { await deleteTaskMutation.mutateAsync(id); setTasks((current) => current.filter((task) => task.id !== id)); onToast("任务已移除"); } catch (error) { onToast(error.message); } };
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
  const navigate = useNavigate();
  const location = useLocation();
  const previewParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const emptyPreview = previewParams.get("state") === "empty";
  const [tasks, setTasks] = useState<Task[]>(emptyPreview ? [] : api.isMock ? initialTasks : []);
  const [models, setModels] = useState<Model[]>(api.isMock ? initialModels : []);
  const [account, setAccount] = useState<Account>({ aid: "—", name: "", phone: "", email: null, avatar_seed: 0 });
  const [wallet, setWallet] = useState<Wallet>({ available: 0, used_this_month: 0, usage_percent: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>(emptyPreview ? [] : transactionRecords);
  const [toast, setToast] = useState<{ message: string; tone: "warning" | "success" } | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(api.isMock && previewParams.get("screen") !== "login" && location.pathname !== "/login");
  const [avatarSeed, setAvatarSeed] = useState(createBackendAvatarSeed);
  const toastTimer = useRef<number | undefined>(undefined);
  const dataEnabled = authenticated && !emptyPreview;
  const tasksQuery = useTasksQuery(dataEnabled);
  const modelsQuery = useModelsQuery(dataEnabled);
  const accountQuery = useAccountQuery(dataEnabled);
  const walletQuery = useWalletQuery(dataEnabled);
  const transactionsQuery = useTransactionsQuery(dataEnabled);
  const view = location.pathname.startsWith("/tasks") ? "tasks" : location.pathname.startsWith("/settings") ? "account" : "home";
  const setView = (next: "home" | "tasks" | "account") => navigate(next === "home" ? "/" : next === "tasks" ? "/tasks" : "/settings/account");
  const showToast = (message: string) => {
    const tone = /请|先写下|失败|未授权/.test(message) ? "warning" : "success";
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => {
    if (api.isMock || previewParams.get("screen") === "login") return;
    api.auth.refresh().then((session) => { setAccount(session.user); setAvatarSeed(session.user.avatar_seed ?? 0); setAuthenticated(true); }).catch(() => setAuthenticated(false));
  }, [previewParams]);
  useEffect(() => {
    if (tasksQuery.data?.items) setTasks(tasksQuery.data.items);
  }, [tasksQuery.data]);
  useEffect(() => { if (modelsQuery.data?.items) setModels(modelsQuery.data.items); }, [modelsQuery.data]);
  useEffect(() => { if (accountQuery.data) { setAccount(accountQuery.data); setAvatarSeed(accountQuery.data.avatar_seed ?? 0); } }, [accountQuery.data]);
  useEffect(() => { if (walletQuery.data) setWallet(walletQuery.data); }, [walletQuery.data]);
  useEffect(() => { if (transactionsQuery.data?.items) setTransactions(transactionsQuery.data.items); }, [transactionsQuery.data]);
  useEffect(() => {
    const error = tasksQuery.error || modelsQuery.error || accountQuery.error || walletQuery.error || transactionsQuery.error;
    if (error) showToast(error instanceof Error ? error.message : "数据同步失败");
  }, [tasksQuery.error, modelsQuery.error, accountQuery.error, walletQuery.error, transactionsQuery.error]);
  useEffect(() => {
    if (!authenticated && location.pathname !== "/login") navigate("/login", { replace: true });
    if (authenticated && location.pathname === "/login") navigate("/", { replace: true });
  }, [authenticated, location.pathname, navigate]);
  const confirmLogout = async () => { try { await api.auth.logout(); } finally { setLogoutOpen(false); setAuthenticated(false); navigate("/login"); } };
  return <div className="app-shell">{authenticated ? <div className="app-content"><Topbar view={view} setView={setView} onAccount={() => navigate("/settings/account")} onAccountSettings={() => navigate("/settings/account")} onBalance={() => navigate("/settings/balance")} onLogout={() => setLogoutOpen(true)} avatarSeed={avatarSeed} credits={wallet.available} />{view === "home" ? <HomeView tasks={tasks} setTasks={setTasks} setView={setView} onToast={showToast} models={models} /> : view === "tasks" ? <TaskCenterV2 tasks={tasks} setTasks={setTasks} setView={setView} onToast={showToast} /> : <SettingsHub setView={setView} onToast={showToast} avatarSeed={avatarSeed} account={account} wallet={wallet} transactions={transactions} />}</div> : <LoginScreen onToast={showToast} onLogin={(session) => { setAccount(session.user); setAvatarSeed(session.user.avatar_seed ?? createBackendAvatarSeed()); setAuthenticated(true); navigate("/"); showToast("登录成功"); }} />}<div className={`toast ${toast ? "show" : ""} ${toast?.tone || ""}`} role="status">{toast?.tone === "warning" ? <IconAlertCircle size={18} /> : <IconCheck size={18} />}{toast?.message || ""}</div>{logoutOpen && <LogoutDialog onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}</div>;
}
