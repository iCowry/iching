import React, { useState, useEffect, useRef } from 'react';
import { FeatureId, UserProfile } from '../types';
import { Card, Button, MarkdownRenderer } from './Layout';
import { getGeminiReading, analyzeImage } from '../services/geminiService';

interface ToolProps {
  featureId: FeatureId;
  user: UserProfile;
  goBack: () => void;
  onOpenVip: () => void;
}

// --- Professional Ziwei Types ---
interface ZiweiStar {
  name: string;
  brightness?: string; // 庙, 旺, 得, 利, 平, 不, 陷
  transformation?: '禄' | '权' | '科' | '忌';
}

interface ZiweiPalace {
  name: string;
  mainStars: ZiweiStar[];
  luckyStars: string[];
  unluckyStars: string[];
  minorStars: string[];
  decadeRange: string;
  branch: string;
  isMing?: boolean;
  isShen?: boolean;
}

interface ZiweiData {
  userInfo: {
    name: string;
    gender: string;
    solarDate: string;
    lunarDate: string;
    bazi: string;
    bureau: string; 
    mingZhu: string;
    shenZhu: string;
  };
  palaces: ZiweiPalace[]; // 0:子 to 11:亥
  analysis: string;
}

// --- Common Types ---
interface DrawStick {
  number: number;
  name: string;
  poem: string;
  level: string;
  story?: string; // 签诗典故
  interpretation?: string;
}

// --- Style Constants ---
const INPUT_STYLE = "w-full bg-black/60 border border-mystic-700 rounded-lg p-2.5 text-white text-sm focus:border-gold-500 focus:outline-none transition-all shadow-inner";
const PANEL_STYLE = "bg-black/40 p-5 rounded-xl border border-mystic-700 shadow-xl backdrop-blur-sm";

// --- Sub-Component: Ziwei Chart Renderer ---
const ZiweiChart: React.FC<{ data: ZiweiData }> = ({ data }) => {
  const renderPalace = (index: number) => {
    const p = data.palaces[index];
    if (!p) return <div className="border border-mystic-800 bg-black/20 rounded h-full"></div>;

    const transStyles = {
      '禄': 'bg-green-600 shadow-[0_0_5px_rgba(22,163,74,0.5)]',
      '权': 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]',
      '科': 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.5)]',
      '忌': 'bg-gray-800 border border-gray-600',
    };

    return (
      <div className={`relative border p-1 md:p-2 flex flex-col h-full min-h-[140px] md:min-h-[180px] transition-all duration-300 ${p.isMing ? 'border-red-600 bg-red-950/20 ring-1 ring-red-600/50' : 'border-mystic-700 bg-black/40 hover:bg-mystic-800/40'}`}>
        <div className="flex flex-row gap-1.5 items-start h-24 overflow-hidden">
          {p.mainStars.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`font-bold text-[13px] md:text-[16px] leading-none w-4 break-words text-center ${p.isMing ? 'text-red-400' : 'text-red-500'}`}>
                {s.name}
              </span>
              <div className="flex flex-col items-center gap-0.5 mt-1">
                {s.brightness && <span className="text-[9px] md:text-[10px] text-orange-300 font-bold">{s.brightness}</span>}
                {s.transformation && (
                  <span className={`text-[9px] text-white px-0.5 py-0.5 rounded leading-none ${transStyles[s.transformation]}`}>
                    {s.transformation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-1 right-1 flex flex-col text-right gap-0.5">
          <div className="flex flex-col text-[8px] md:text-[10px] text-blue-300 font-medium">
            {p.luckyStars?.slice(0, 3).map((s, i) => <span key={i}>{s}</span>)}
          </div>
          <div className="flex flex-col text-[8px] md:text-[10px] text-gray-400 italic">
            {p.unluckyStars?.slice(0, 3).map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </div>
        <div className="absolute bottom-6 left-1 text-[9px] md:text-[11px] text-mystic-500 font-mono italic">
          {p.decadeRange}
        </div>
        <div className="mt-auto flex justify-between items-end border-t border-mystic-800/50 pt-1">
          <span className={`font-bold text-[11px] md:text-[14px] ${p.isMing ? 'text-red-500 underline decoration-red-500/50' : 'text-gold-400'}`}>
            {p.name}
            {p.isShen && <span className="text-[9px] text-pink-400 ml-0.5 font-normal">(身)</span>}
          </span>
          <span className="text-mystic-500 text-[10px] md:text-xs">{p.branch}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 grid-rows-4 gap-1 aspect-square max-w-4xl mx-auto border-4 border-mystic-800 p-1 rounded-2xl bg-mystic-950 shadow-2xl relative animate-[fadeIn_1s]">
        {renderPalace(5)} {renderPalace(6)} {renderPalace(7)} {renderPalace(8)}
        {renderPalace(4)}
        <div className="col-span-2 row-span-2 flex flex-col items-center justify-between p-4 text-center bg-black/40 border border-gold-600/10 rounded m-1 shadow-inner backdrop-blur-sm">
           <div className="w-full text-gold-400 font-serif font-bold text-lg md:text-2xl tracking-[0.3em] border-b-2 border-double border-gold-600/30 pb-2">
            文墨天机 · 专业版
           </div>
           <div className="flex-1 flex flex-col justify-center space-y-2 w-full">
             <div className="flex justify-center gap-6 text-sm md:text-xl font-serif">
                <p><span className="text-mystic-500">姓名:</span> {data.userInfo.name}</p>
                <p><span className="text-mystic-500">性别:</span> {data.userInfo.gender}</p>
             </div>
             <div className="space-y-1 text-[10px] md:text-xs text-mystic-300">
               <p><span className="text-mystic-500">公历:</span> {data.userInfo.solarDate}</p>
               <p><span className="text-mystic-500">农历:</span> {data.userInfo.lunarDate}</p>
             </div>
             <div className="bg-red-950/30 p-2 md:p-3 rounded border border-red-900/40 my-2">
                <p className="text-red-500 font-bold text-sm md:text-lg mb-1">{data.userInfo.bureau}</p>
                <div className="text-xs md:text-base font-mono text-gold-500/90 whitespace-pre-wrap leading-tight tracking-widest">
                  {data.userInfo.bazi}
                </div>
             </div>
             <div className="flex justify-center gap-6 text-[11px] md:text-sm font-serif">
                <p><span className="text-mystic-500">命主:</span> <span className="text-gold-400">{data.userInfo.mingZhu}</span></p>
                <p><span className="text-mystic-500">身主:</span> <span className="text-gold-400">{data.userInfo.shenZhu}</span></p>
             </div>
           </div>
           <div className="text-[8px] md:text-[10px] text-mystic-600 tracking-widest uppercase">Traditional Ziwei Engine v3.1</div>
        </div>
        {renderPalace(9)}
        {renderPalace(3)}
        {renderPalace(10)}
        {renderPalace(2)} {renderPalace(1)} {renderPalace(0)} {renderPalace(11)}
      </div>
      <div className="bg-black/40 p-6 md:p-10 rounded-2xl border border-mystic-800 shadow-xl">
        <h4 className="text-xl md:text-2xl font-serif text-gold-400 mb-6 border-l-4 border-gold-500 pl-4">命宫星曜 · 深度详批</h4>
        <MarkdownRenderer content={data.analysis} />
      </div>
    </div>
  );
};

// --- Sub-Component: AI Vision Tool (Face/Palm) ---
const VisionTool: React.FC<{ featureId: FeatureId; featureName: string; onOpenVip: () => void; user: UserProfile }> = ({ featureId, featureName, onOpenVip, user }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const prompt = `请作为${featureName}大师，分析此图。给出详细的面相/手相解读，包括性格、财运、事业及未来建议。`;
      const res = await analyzeImage(featureName, image, prompt);
      setResult(res);
    } catch (e) {
      setResult("法眼受阻，未能看清，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-mystic-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-gold-600 transition-colors"
        >
          <div className="text-5xl mb-4">📸</div>
          <p className="text-gold-400 font-serif">点击上传照片进行智能识人</p>
          <p className="text-xs text-mystic-500 mt-2">（面部正面或手掌清晰照）</p>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden border border-mystic-700">
            <img src={image} className="w-full h-full object-cover" alt="Analysis" />
            <button onClick={() => {setImage(null); setResult(null);}} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full">✕</button>
          </div>
          {!result ? (
            <Button fullWidth onClick={analyze} disabled={loading}>
              {loading ? '正在扫描运势纹理...' : '开启 AI 智能解析'}
            </Button>
          ) : (
            <div className="bg-black/40 p-5 rounded-xl border border-mystic-700 animate-[fadeIn_0.5s]">
              <MarkdownRenderer content={result} />
              <Button className="mt-6" variant="secondary" fullWidth onClick={() => setResult(null)}>重新分析</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Naming Tool ---
const NamingTool: React.FC<{ onOpenVip: () => void }> = ({ onOpenVip }) => {
  const [mode, setMode] = useState<'GENERATE' | 'RATE'>('GENERATE');
  const [surname, setSurname] = useState('');
  const [fullName, setFullName] = useState('');
  const [date, setDate] = useState('2024-02-04');
  const [time, setTime] = useState('09:00');
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (mode === 'GENERATE' && !surname) return alert('请输入姓氏');
    if (mode === 'RATE' && !fullName) return alert('请输入完整姓名');

    setLoading(true);
    try {
      const isGenerate = mode === 'GENERATE';
      const prompt = isGenerate
        ? `请作为专业起名大师，根据生辰八字为姓氏【${surname}】的【${gender === 'male' ? '男' : '女'}】宝宝起名。
           出生时间：${date} ${time}。
           任务要求：
           1. 排八字，分析五行喜用神（简要）。
           2. 推荐 5 个高分吉祥好名。
           3. 每个名字需包含：【名字】、【读音】、【五行配置】、【三才五格评分】、【文化寓意】（引经据典）。
           4. 输出格式为 Markdown 清单。`
        : `请对姓名【${fullName}】进行专业八字姓名测试打分。
           性别：${gender === 'male' ? '男' : '女'}。
           出生时间：${date} ${time}。
           任务要求：
           1. 排八字，定五行喜忌。
           2. 分析姓名三才五格（天格、地格、人格、外格、总格）吉凶。
           3. 给出综合评分（0-100分）。
           4. 给出详细的吉凶分析和建议。
           5. 输出格式为 Markdown。`;

      const context = `业务类型:${isGenerate ? '起名' : '测名'}, 姓氏/姓名:${isGenerate ? surname : fullName}, 生辰:${date} ${time}`;
      const res = await getGeminiReading(isGenerate ? '八字起名' : '姓名测试', prompt, context, false);
      setResult(res);
    } catch (e) {
      setResult("服务器繁忙，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="animate-[fadeIn_0.5s] space-y-6">
         <div className="bg-black/40 p-6 rounded-xl border border-mystic-700">
             <MarkdownRenderer content={result} />
         </div>
         <Button variant="secondary" fullWidth onClick={() => setResult(null)}>继续{mode === 'GENERATE' ? '起名' : '测名'}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-black/40 p-1 rounded-lg border border-mystic-700">
        <button 
          onClick={() => setMode('GENERATE')}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${mode === 'GENERATE' ? 'bg-gold-600 text-mystic-900 font-bold' : 'text-mystic-400 hover:text-gold-400'}`}
        >
          ✨ 智能起名
        </button>
        <button 
          onClick={() => setMode('RATE')}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${mode === 'RATE' ? 'bg-gold-600 text-mystic-900 font-bold' : 'text-mystic-400 hover:text-gold-400'}`}
        >
          📝 姓名打分
        </button>
      </div>

      <div className={PANEL_STYLE}>
         <h4 className="text-gold-400 font-serif border-l-4 border-gold-500 pl-3 mb-4">
            {mode === 'GENERATE' ? '宝宝出生信息' : '个人测算信息'}
         </h4>
         <div className="space-y-4">
            {mode === 'GENERATE' ? (
                <div className="space-y-1">
                    <label className="text-xs text-mystic-500 ml-1">姓氏</label>
                    <input type="text" value={surname} onChange={e => setSurname(e.target.value)} className={INPUT_STYLE} placeholder="例如：李" />
                </div>
            ) : (
                <div className="space-y-1">
                     <label className="text-xs text-mystic-500 ml-1">完整姓名</label>
                     <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={INPUT_STYLE} placeholder="例如：李华" />
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-mystic-500 ml-1">性别</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className={INPUT_STYLE}>
                        <option value="male">男</option>
                        <option value="female">女</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-mystic-500 ml-1">出生日期</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT_STYLE} />
                </div>
            </div>
            <div className="space-y-1">
                 <label className="text-xs text-mystic-500 ml-1">出生时间</label>
                 <input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_STYLE} />
            </div>
         </div>
      </div>

      <Button fullWidth onClick={handleSubmit} disabled={loading}>
        {loading ? '大师正在推演五行...' : (mode === 'GENERATE' ? '开始生成美名' : '开始姓名评分')}
      </Button>
      
      <p className="text-center text-xs text-mystic-500 mt-2">
        {mode === 'GENERATE' ? '结合周易八字、三才五格、诗词典故' : '深度分析八字契合度、五格吉凶'}
      </p>
    </div>
  );
};

// --- Sub-Component: Daily Draw (Professionally Anchored) ---
const DailyDrawTool: React.FC<{ user: UserProfile, onOpenVip: () => void }> = ({ user, onOpenVip }) => {
  const [step, setStep] = useState<'SELECT' | 'DRAWING' | 'RESULT'>('SELECT');
  const [temple, setTemple] = useState('观音灵签');
  const [topic, setTopic] = useState('综合运势');
  const [stick, setStick] = useState<DrawStick | null>(null);
  const [loadingJie, setLoadingJie] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [manualNum, setManualNum] = useState<string>('');

  // Traditional total sticks for each temple
  const templeStickCounts: Record<string, number> = {
    '观音灵签': 100,
    '关帝灵签': 100,
    '吕祖灵签': 100,
    '黄大仙灵签': 100,
    '妈祖灵签': 60,
    '车公灵签': 96
  };

  const fetchStickData = async (num: number) => {
    const prompt = `你是一个精通中国传统签书（灵签）的专家。
    请调取“${temple}”中的第 ${num} 签的【真实历史记录】。
    返回 JSON 格式：
    {
      "number": ${num},
      "name": "第X签 (对应的签名/卦名)",
      "poem": "该签真实的四句七言/五言原诗",
      "level": "真实对应的等第（如：大吉、中平）",
      "story": "该签对应的历史典故或故事背景（如：苏武牧羊）"
    }
    请务必尊重历史文献，不要杜撰。`;
    
    const res = await getGeminiReading(temple, prompt, `查询签号:${num}`, true);
    return JSON.parse(res.replace(/```json|```/g, '').trim());
  };

  const startDraw = async () => {
    setStep('DRAWING');
    try {
      const maxSticks = templeStickCounts[temple] || 100;
      const stickNumber = Math.floor(Math.random() * maxSticks) + 1;
      const data = await fetchStickData(stickNumber);
      setStick(data);
      setTimeout(() => setStep('RESULT'), 2500);
    } catch (e) { 
      setStep('SELECT'); 
      alert("灵场波动，请重新祈愿。");
    }
  };

  const handleManualSubmit = async () => {
    const num = parseInt(manualNum);
    const max = templeStickCounts[temple] || 100;
    if (isNaN(num) || num < 1 || num > max) {
      alert(`请输入 1 到 ${max} 之间的有效签号`);
      return;
    }
    setLoadingJie(true);
    try {
      const data = await fetchStickData(num);
      setStick(data);
      setStep('RESULT');
    } catch (e) {
      alert("查询失败，请检查网络或签号。");
    } finally {
      setLoadingJie(false);
    }
  };

  const fetchInterpretation = async () => {
    if (!user.isVip) {
      onOpenVip();
      return;
    }
    setLoadingJie(true);
    try {
      const prompt = `作为精通《${temple}》解析的顶级大师，请根据以下真实的签位信息进行专业解签：
      签号：第 ${stick?.number} 签
      签名：${stick?.name}
      原诗：${stick?.poem}
      典故：${stick?.story}
      
      用户求问：${topic}
      
      请给出专业的详尽解读，包括：
      1. 【诗词白话释义】：精准翻译原诗内涵。
      2. 【典故启示】：解析历史故事对现状的投射。
      3. 【核心断曰】：针对“${topic}”的一句话总评。
      4. 【详细建议】：分事项（事业、姻缘、求财、健康等）给出具体的行为指导。
      语气要深沉、古朴且具有大师风范。`;
      
      const res = await getGeminiReading(temple, prompt, `签位详情:${JSON.stringify(stick)}`, false);
      setInterpretation(res);
    } catch (e) {
      setInterpretation("天机混沌，暂无法解签。");
    } finally {
      setLoadingJie(false);
    }
  };

  if (step === 'DRAWING') return (
    <div className="py-24 flex flex-col items-center">
      <div className="w-32 h-52 bg-gradient-to-b from-orange-800 to-orange-950 rounded-t-3xl border-4 border-orange-900 animate-[shake_0.5s_infinite] relative shadow-[0_0_30px_rgba(139,69,19,0.5)]">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-2.5 h-24 bg-yellow-600 rounded-full border border-orange-900 animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>
          ))}
        </div>
      </div>
      <p className="mt-16 text-gold-400 font-serif text-xl animate-pulse tracking-widest">诚心祈愿，摇动签筒...</p>
      <style>{`
        @keyframes shake {
          0% { transform: rotate(0); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
    </div>
  );

  if (step === 'RESULT') return (
    <div className="text-center space-y-8 animate-[fadeIn_0.5s]">
      <div className="bg-[#fff9eb] text-gray-900 p-8 rounded-lg shadow-2xl border-4 border-double border-red-800 inline-block max-w-sm mx-auto relative">
        <div className="absolute -top-4 -left-4 bg-red-800 text-white p-2 rounded font-bold text-xs">诚心所得</div>
        <h2 className="text-3xl font-serif font-bold text-red-800 mb-2">{stick?.name}</h2>
        <div className="text-lg font-bold text-orange-700 mb-4 border-b border-red-200 pb-2">{stick?.level}</div>
        <div className="text-xs text-red-900/60 font-serif mb-4 italic">典故：{stick?.story}</div>
        <p className="text-xl font-serif italic tracking-[0.3em] whitespace-pre-line leading-relaxed py-4">
          {stick?.poem.split('。').join('。\n')}
        </p>
      </div>

      <div className="space-y-4">
        {!interpretation ? (
          <div className="bg-black/40 p-6 rounded-xl border border-mystic-700 space-y-4">
            <p className="text-mystic-300 text-sm">此签出自《{temple}》第{stick?.number}签，建议开启专业解签</p>
            <Button fullWidth onClick={fetchInterpretation} disabled={loadingJie}>
              {loadingJie ? '大师正在翻阅典籍...' : user.isVip ? '开启专业大师解签' : '🔒 VIP 专属专业解签'}
            </Button>
          </div>
        ) : (
          <div className="text-left bg-black/60 p-6 rounded-xl border border-gold-600/30 animate-[slideDown_0.5s]">
            <h4 className="text-gold-400 font-serif text-lg mb-4 border-b border-mystic-800 pb-2 flex items-center gap-2">
              <span>📜</span> 大师详批
            </h4>
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <MarkdownRenderer content={interpretation} />
            </div>
          </div>
        )}
        <Button variant="secondary" onClick={() => {setStep('SELECT'); setInterpretation(null); setManualNum(''); setIsManual(false);}} fullWidth>再求一签</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-gold-400 mb-2">沐浴焚香 · 诚心求问</h3>
        <p className="text-mystic-400 text-sm">选择灵场，默想所求之事</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {['观音灵签', '关帝灵签', '吕祖灵签', '黄大仙灵签', '妈祖灵签', '车公灵签'].map(t => (
          <button 
            key={t} 
            onClick={() => setTemple(t)} 
            className={`p-3 rounded-xl border transition-all ${temple === t ? 'bg-gold-600 text-mystic-900 border-gold-400 font-bold shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'bg-mystic-950 text-mystic-400 border-mystic-800 hover:border-mystic-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <label className="text-xs text-mystic-400 block ml-1">所求之事</label>
        <div className="grid grid-cols-3 gap-2">
          {['综合运势', '事业学业', '姻缘感情', '求财利禄', '健康平安', '家宅变动'].map(t => (
            <button 
              key={t} 
              onClick={() => setTopic(t)} 
              className={`py-2 px-1 rounded text-xs border ${topic === t ? 'bg-red-800 text-white border-red-600' : 'bg-black/40 text-mystic-400 border-mystic-800'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-mystic-800">
        <div className="flex justify-center gap-4 mb-4">
          <button 
            onClick={() => setIsManual(false)}
            className={`text-sm px-4 py-1 rounded-full border transition-all ${!isManual ? 'bg-gold-600/20 text-gold-400 border-gold-600' : 'text-mystic-500 border-mystic-800'}`}
          >
            诚心摇签
          </button>
          <button 
            onClick={() => setIsManual(true)}
            className={`text-sm px-4 py-1 rounded-full border transition-all ${isManual ? 'bg-gold-600/20 text-gold-400 border-gold-600' : 'text-mystic-500 border-mystic-800'}`}
          >
            指定签号
          </button>
        </div>

        {isManual ? (
          <div className="space-y-4 animate-[fadeIn_0.3s]">
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder={`输入签号 (1-${templeStickCounts[temple] || 100})`}
                value={manualNum}
                onChange={e => setManualNum(e.target.value)}
                className={INPUT_STYLE + " text-center text-lg"}
              />
            </div>
            <Button onClick={handleManualSubmit} fullWidth disabled={loadingJie}>
              {loadingJie ? '正在翻阅签书...' : '直接解签'}
            </Button>
          </div>
        ) : (
          <Button onClick={startDraw} fullWidth className="text-lg">诚心起签</Button>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Birth Form (Chinese Classics) ---
const BirthDataForm: React.FC<{ 
  onSubmit: (data: string) => void; 
  isLoading: boolean;
  featureName: string;
  featureId: FeatureId;
}> = ({ onSubmit, isLoading, featureName, featureId }) => {
  const [name, setName] = useState('黄建成');
  const [date, setDate] = useState('1987-09-24');
  const [time, setTime] = useState('05:00');
  const [gender, setGender] = useState('male');
  
  const [name2, setName2] = useState('姜珮瑶');
  const [date2, setDate2] = useState('1994-03-10');
  const [time2, setTime2] = useState('14:00');
  const [gender2, setGender2] = useState('female');

  const [question, setQuestion] = useState('');
  
  const isCompatibility = featureId === FeatureId.BAZI_COMPATIBILITY || featureId === FeatureId.ASTROLOGY;

  const handleSubmit = () => {
    let dataString = `【甲方】姓名:${name}, 性别:${gender === 'male' ? '男' : '女'}, 出生日期:${date}, 出生时间:${time}`;
    if (isCompatibility) {
      dataString += `\n【乙方】姓名:${name2}, 性别:${gender2 === 'male' ? '男' : '女'}, 出生日期:${date2}, 出生时间:${time2}`;
    }
    dataString += `\n关注问题:${question || '综合分析'}`;
    onSubmit(dataString);
  };

  return (
    <div className="space-y-6">
      <div className={PANEL_STYLE}>
        <h4 className="text-gold-400 font-serif border-l-4 border-gold-500 pl-3 mb-4">
          {isCompatibility ? '甲方（男方）资料' : '出生资料'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="姓名" value={name} onChange={e => setName(e.target.value)} className={INPUT_STYLE} />
          <select value={gender} onChange={e => setGender(e.target.value as any)} className={INPUT_STYLE}>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT_STYLE} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_STYLE} />
        </div>
      </div>

      {isCompatibility && (
        <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/40 animate-[fadeIn_0.3s]">
          <h4 className="text-pink-400 font-serif border-l-4 border-pink-500 pl-3 mb-4">乙方（女方）资料</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="姓名" value={name2} onChange={e => setName2(e.target.value)} className={INPUT_STYLE} />
            <select value={gender2} onChange={e => setGender2(e.target.value as any)} className={INPUT_STYLE}>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className={INPUT_STYLE} />
            <input type="time" value={time2} onChange={e => setTime2(e.target.value)} className={INPUT_STYLE} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-mystic-400 ml-1">您想了解的重点</label>
        <textarea 
          value={question} 
          onChange={e => setQuestion(e.target.value)} 
          className={INPUT_STYLE + " h-24"}
          placeholder="例如：未来一年的事业财运，或者姻缘何时出现..." 
        />
      </div>

      <Button fullWidth onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? '正在查阅命理典籍...' : `开启${featureName}深度推演`}
      </Button>
    </div>
  );
};

// --- Sub-Component: Tarot ---
const TarotTool: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const drawTarot = async () => {
    setLoading(true);
    try {
      const res = await getGeminiReading('塔罗牌', '从78张塔罗牌中随机选3张进行过去、现在、未来的占卜分析。返回结果格式：Markdown。', '', false);
      setResult(res);
    } finally { setLoading(false); }
  };

  if (result) return (
    <div className="animate-[fadeIn_0.5s] space-y-6">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-indigo-950 rounded-lg border-2 border-gold-500 flex flex-col items-center justify-center text-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
            <span className="relative z-10 group-hover:scale-125 transition-transform">🃏</span>
            <div className="absolute bottom-1 text-[8px] text-gold-400 uppercase tracking-widest">{i === 1 ? 'Past' : i === 2 ? 'Present' : 'Future'}</div>
          </div>
        ))}
      </div>
      <div className="bg-black/40 p-5 rounded-xl border border-mystic-700">
        <MarkdownRenderer content={result} />
      </div>
      <Button variant="secondary" fullWidth onClick={() => setResult(null)}>清空牌阵</Button>
    </div>
  );

  return (
    <div className="text-center py-10 space-y-8">
      <div className="relative h-40 flex items-center justify-center">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-16 h-28 bg-indigo-950 border border-gold-700/50 rounded-md shadow-lg transform hover:-translate-y-4 transition-all duration-300"
            style={{ 
              left: `calc(50% + ${(i - 7) * 15}px)`, 
              rotate: `${(i - 7) * 5}deg`,
              zIndex: i 
            }}
          >
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/skulls.png')] opacity-20"></div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-serif text-gold-400">屏息静念，揭示命运</h3>
        <p className="text-mystic-400 text-sm">默想你心中的疑问，宇宙将通过牌阵给予指引</p>
      </div>
      <Button onClick={drawTarot} disabled={loading} className="text-lg px-12">
        {loading ? '星轨运行中...' : '开始三牌阵占卜'}
      </Button>
    </div>
  );
};

// --- Sub-Component: Liu Yao ---
const LiuYaoTool: React.FC = () => {
  const [lines, setLines] = useState<number[]>([]);
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const shake = () => {
    if (lines.length >= 6) return;
    setShaking(true);
    setTimeout(() => {
      const newLine = Math.floor(Math.random() * 4) + 6; 
      setLines([newLine, ...lines]);
      setShaking(false);
    }, 600);
  };

  const getInterpretation = async () => {
    setShaking(true);
    try {
      const res = await getGeminiReading('六爻占卜', `卦象序列(由初爻到六爻): ${lines.reverse().join(',')}`, '请详细解读本卦、互卦、变卦。', false);
      setResult(res);
    } catch (e) {
      setResult("起卦失灵，请重新摇卦。");
    } finally {
      setShaking(false);
    }
  };

  const Line = ({ value }: { value: number }) => {
    const isYang = value % 2 !== 0;
    const isMoving = value === 6 || value === 9;
    return (
      <div className="flex items-center gap-4 w-full justify-center group">
        <div className={`h-2.5 flex-1 rounded-full shadow-lg ${isYang ? 'bg-gradient-to-r from-gold-600 to-gold-400' : 'flex gap-2'}`}>
          {!isYang && <><div className="flex-1 bg-mystic-500 rounded-full"></div><div className="flex-1 bg-mystic-500 rounded-full"></div></>}
        </div>
        <div className="w-6 text-center">
          {isMoving && <span className="text-red-500 font-bold animate-pulse">○</span>}
        </div>
      </div>
    );
  };

  if (result) return (
    <div className="animate-[fadeIn_0.5s] space-y-6">
      <div className="bg-black/40 p-6 rounded-xl border border-mystic-700">
        <MarkdownRenderer content={result} />
      </div>
      <Button variant="secondary" fullWidth onClick={() => { setLines([]); setResult(null); }}>重设坛台</Button>
    </div>
  );

  return (
    <div className="space-y-10 text-center py-6">
      <div className="max-w-[240px] mx-auto space-y-3 flex flex-col-reverse">
        {lines.map((l, i) => <Line key={i} value={l} />)}
        {Array.from({ length: 6 - lines.length }).map((_, i) => (
          <div key={i} className="h-2.5 w-full bg-mystic-950 border border-mystic-900 rounded-full opacity-20"></div>
        ))}
      </div>
      
      <div className="space-y-4">
        {lines.length < 6 ? (
          <Button onClick={shake} disabled={shaking} fullWidth className="h-16 text-lg">
            {shaking ? '金钱落地，如闻天籁...' : `掷下第 ${lines.length + 1} 枚金钱`}
          </Button>
        ) : (
          <Button onClick={getInterpretation} disabled={shaking} fullWidth className="h-16 text-lg">
            {shaking ? '正在推演八八六十四卦...' : '六爻已成，开坛解卦'}
          </Button>
        )}
        <p className="text-mystic-500 text-xs">传统金钱起卦法：三钱落地，六次成卦</p>
      </div>
    </div>
  );
};

// --- Sub-Component: Feng Shui Compass ---
const FengShuiCompass: React.FC = () => {
  const [heading, setHeading] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const handler = (e: any) => {
      const h = e.webkitCompassHeading || e.alpha || 0;
      setHeading(h);
    };
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handler);
    } else {
      setIsSupported(false);
    }
    
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  return (
    <div className="flex flex-col items-center py-10 space-y-12">
      <div className="relative w-72 h-72 md:w-96 md:h-96 transition-transform duration-500 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
        <div className="absolute inset-0 rounded-full border-8 border-[#5c0b0b] bg-[#1a0b2e] shadow-[0_0_50px_rgba(255,183,0,0.2)] flex items-center justify-center p-4">
          <div className="absolute inset-0 rounded-full border border-gold-600/30"></div>
          {/* Compass Markings */}
          <div className="absolute top-4 font-bold text-red-600 text-xl font-serif">午(南)</div>
          <div className="absolute bottom-4 font-bold text-mystic-100 text-xl font-serif">子(北)</div>
          <div className="absolute left-4 font-bold text-mystic-100 text-xl font-serif">卯(东)</div>
          <div className="absolute right-4 font-bold text-mystic-100 text-xl font-serif">酉(西)</div>
          
          <div className="w-0.5 h-full bg-gold-600/20 absolute"></div>
          <div className="h-0.5 w-full bg-gold-600/20 absolute"></div>
          
          {/* Internal Rings */}
          <div className="w-2/3 h-2/3 border border-gold-600/10 rounded-full absolute"></div>
          <div className="w-1/3 h-1/3 border border-gold-600/10 rounded-full absolute"></div>
        </div>
        {/* Needle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-4 h-full flex flex-col items-center">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[60px] md:border-b-[100px] border-b-red-600 mb-1"></div>
            <div className="w-3 h-3 bg-gold-400 rounded-full z-20 border-2 border-[#1a0b2e]"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[60px] md:border-t-[100px] border-t-mystic-400 mt-1"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <div className="text-5xl font-mono text-gold-400 font-bold bg-black/40 px-6 py-2 rounded-full border border-mystic-700">{Math.round(heading)}°</div>
        <div>
          <h4 className="text-xl font-serif text-gold-500 mb-1">九天应元 · 罗盘定穴</h4>
          <p className="text-mystic-400 text-sm">请平放手机，罗盘将自动感应天地磁场</p>
        </div>
        {!isSupported && <p className="text-red-500 text-xs">您的设备可能不支持方位感应器</p>}
      </div>
    </div>
  );
};

// --- Main Feature Runner ---
export const FeatureRunner: React.FC<ToolProps> = ({ featureId, user, goBack, onOpenVip }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const featureNameMap: Record<string, string> = {
    [FeatureId.ZIWEI]: '紫微斗数',
    [FeatureId.BAZI]: '四柱八字',
    [FeatureId.NAMING]: '八字起名',
    [FeatureId.BAZI_COMPATIBILITY]: '八字合婚',
    [FeatureId.LIUYAO]: '六爻占卜',
    [FeatureId.TAROT]: '塔罗牌',
    [FeatureId.FENGSHUI]: '风水罗盘',
    [FeatureId.DAILY_DRAW]: '每日一签',
    [FeatureId.ASTROLOGY]: '西洋占星',
    [FeatureId.NUMEROLOGY]: '生命灵数',
    [FeatureId.FACE_READING]: '面相分析',
    [FeatureId.PALM_READING]: '手相解读',
    [FeatureId.QIMEN]: '奇门遁甲',
  };

  const featureName = featureNameMap[featureId] || '命理推演';

  const handleAnalysis = async (data: string) => {
    setLoading(true);
    try {
      const res = await getGeminiReading(featureName, "请进行深度万字详批。返回Markdown格式。", data, false);
      setResult(res);
    } catch(e) { 
      setResult("推演超时，缘分未足。"); 
    } finally { 
      setLoading(false); 
    }
  };

  const renderTool = () => {
    if (loading) return (
      <div className="py-32 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-gold-400 font-serif text-xl animate-pulse tracking-widest">正在拨动命运轮盘...</p>
      </div>
    );

    switch(featureId) {
      case FeatureId.DAILY_DRAW: return <DailyDrawTool user={user} onOpenVip={onOpenVip} />;
      case FeatureId.NAMING: return <NamingTool onOpenVip={onOpenVip} />;
      case FeatureId.TAROT: return <TarotTool user={user} />;
      case FeatureId.LIUYAO: return <LiuYaoTool />;
      case FeatureId.FENGSHUI: return <FengShuiCompass />;
      case FeatureId.FACE_READING: 
      case FeatureId.PALM_READING: return <VisionTool featureId={featureId} featureName={featureName} user={user} onOpenVip={onOpenVip} />;
      default:
        if (result) return (
          <div className="animate-[fadeIn_0.5s] space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-mystic-700">
              <MarkdownRenderer content={result} />
            </div>
            <Button variant="secondary" fullWidth onClick={() => setResult(null)}>重新起盘</Button>
          </div>
        );
        return <BirthDataForm featureId={featureId} featureName={featureName} isLoading={loading} onSubmit={handleAnalysis} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={goBack} className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>返回</span>
        </button>
        <h2 className="text-2xl font-serif text-gold-400 tracking-widest">{featureName}</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>
      <div className="bg-[#11081a] border border-mystic-800 rounded-3xl p-4 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[500px]">
        {renderTool()}
      </div>
    </div>
  );
};