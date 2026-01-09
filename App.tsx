import React, { useState } from 'react';
import { MenuItem, FeatureId, ToolCategory, UserProfile } from './types';
import { Header, Card, Modal, Button } from './components/Layout';
import { FeatureRunner } from './components/Tools';

// --- Static Data ---
const MENU_ITEMS: MenuItem[] = [
  // Daily
  { id: FeatureId.ALMANAC, name: '老黄历', description: '每日宜忌，吉神方位', icon: '📅', category: ToolCategory.DAILY },
  { id: FeatureId.DAILY_DRAW, name: '每日一签', description: '诚心求签，指点迷津', icon: '🎋', category: ToolCategory.DAILY },
  { id: FeatureId.DAILY_FORTUNE_CN, name: '生肖日运', description: '今日运势，吉凶祸福', icon: '🐲', category: ToolCategory.DAILY },
  { id: FeatureId.DAILY_GUIDANCE_WEST, name: '每日占卜', description: '宇宙讯息，心灵指引', icon: '🔮', category: ToolCategory.DAILY },

  // Chinese
  { id: FeatureId.BAZI, name: '四柱八字', description: '批八字，测流年，知天命', icon: '📜', category: ToolCategory.CHINESE },
  { id: FeatureId.NAMING, name: '八字起名', description: '五行起名，姓名评分', icon: '✍️', category: ToolCategory.CHINESE },
  { id: FeatureId.BAZI_COMPATIBILITY, name: '八字合婚', description: '姻缘匹配，合盘分析', icon: '💞', category: ToolCategory.CHINESE },
  { id: FeatureId.ZIWEI, name: '紫微斗数', description: '帝王之术，十四主星详解', icon: '✨', category: ToolCategory.CHINESE, isVip: true },
  { id: FeatureId.LIUYAO, name: '六爻占卜', description: '遇事不决，摇卦问卜', icon: '🪙', category: ToolCategory.CHINESE },
  { id: FeatureId.QIMEN, name: '奇门遁甲', description: '运筹帷幄，决胜千里', icon: '🛡️', category: ToolCategory.CHINESE, isVip: true },
  { id: FeatureId.FENGSHUI, name: '风水堪舆', description: '罗盘定穴，家居风水', icon: '🧭', category: ToolCategory.INTERACTIVE },
  { id: FeatureId.FACE_READING, name: 'AI 面相', description: '上传照片，智能识人', icon: '👤', category: ToolCategory.VISION },
  { id: FeatureId.PALM_READING, name: 'AI 手相', description: '掌纹扫描，解读运势', icon: '✋', category: ToolCategory.VISION },
  
  // Western
  { id: FeatureId.ASTROLOGY, name: '占星术', description: '本命星盘，行星相位', icon: '🌌', category: ToolCategory.WESTERN },
  { id: FeatureId.TAROT, name: '塔罗牌', description: '78张韦特塔罗指引', icon: '🃏', category: ToolCategory.INTERACTIVE },
  { id: FeatureId.NUMEROLOGY, name: '生命灵数', description: '数字能量，生命密码', icon: '🔢', category: ToolCategory.WESTERN },
  { id: FeatureId.RUNES, name: '如尼符文', description: '北欧古文字占卜', icon: '🪨', category: ToolCategory.WESTERN },
  { id: FeatureId.KABBALAH, name: '卡巴拉', description: '生命之树，智慧源流', icon: '🌳', category: ToolCategory.WESTERN, isVip: true },
];

const CATEGORIES = [
  { id: ToolCategory.DAILY, name: '每日必看' },
  { id: ToolCategory.CHINESE, name: '国学经典' },
  { id: ToolCategory.WESTERN, name: '西方神秘' },
  { id: ToolCategory.VISION, name: 'AI 观相' },
  { id: ToolCategory.INTERACTIVE, name: '互动工具' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<FeatureId | 'DASHBOARD'>('DASHBOARD');
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: '缘主',
    gender: 'male',
    birthDate: '',
    birthTime: '',
    isVip: false
  });

  const handleToolClick = (item: MenuItem) => {
    if (item.isVip && !user.isVip) {
      setVipModalOpen(true);
      return;
    }
    setCurrentView(item.id);
  };

  const handleVipPurchase = () => {
    // Mock purchase
    setTimeout(() => {
      setUser(prev => ({ ...prev, isVip: true }));
      setVipModalOpen(false);
      alert("恭喜您，已成为尊贵的VIP会员！开启全部玄学功能。");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-mystic-900 text-gold-100 pb-12 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <Header user={user} onVipClick={() => setVipModalOpen(true)} onHomeClick={() => setCurrentView('DASHBOARD')} />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {currentView === 'DASHBOARD' ? (
          <div className="space-y-8 md:space-y-12 animate-[fadeIn_0.5s]">
            {/* Welcome Section */}
            <div className="text-center space-y-2 md:space-y-4 mb-8 md:mb-12 mt-4">
              <h2 className="text-2xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600">
                探索命运的玄机
              </h2>
              <p className="text-xs md:text-base text-mystic-300 max-w-2xl mx-auto px-4">
                汇集古今中外玄学智慧，AI赋能传统命理。
              </p>
            </div>

            {CATEGORIES.map(cat => (
              <section key={cat.id}>
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-mystic-600"></div>
                  <h3 className="text-lg md:text-2xl font-serif text-gold-400 font-bold">{cat.name}</h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-mystic-600"></div>
                </div>
                
                {/* Mobile: grid-cols-2, Desktop: grid-cols-4 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {MENU_ITEMS.filter(item => item.category === cat.id).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleToolClick(item)}
                      className="group relative bg-mystic-800/50 backdrop-blur border border-mystic-700 rounded-xl p-3 md:p-6 hover:bg-mystic-800 hover:border-gold-600 transition-all cursor-pointer overflow-hidden flex flex-col items-center md:block text-center md:text-left"
                    >
                      {item.isVip && !user.isVip && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 text-[10px] md:text-xs bg-black/50 text-gold-500 px-1.5 py-0.5 rounded border border-gold-600/50 z-10">
                          VIP
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div className="text-3xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      
                      {/* Name */}
                      <h4 className="text-sm md:text-xl font-bold text-gray-100 mb-1 md:mb-2 group-hover:text-gold-400">
                        {item.name}
                      </h4>
                      
                      {/* Description - Hidden on very small screens or clamped? Clamped is better. */}
                      <p className="text-xs md:text-sm text-mystic-400 group-hover:text-mystic-200 line-clamp-2 md:line-clamp-none min-h-[2.5em] md:min-h-0">
                        {item.description}
                      </p>
                      
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 to-gold-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <FeatureRunner 
            featureId={currentView} 
            user={user} 
            goBack={() => setCurrentView('DASHBOARD')} 
            onOpenVip={() => setVipModalOpen(true)}
          />
        )}
      </main>

      {/* VIP Modal */}
      <Modal isOpen={vipModalOpen} onClose={() => setVipModalOpen(false)}>
        <div className="text-center space-y-6">
          <div className="text-5xl">👑</div>
          <h3 className="text-2xl font-bold text-gold-400">开通 VIP 会员</h3>
          <ul className="text-left space-y-3 text-mystic-200 bg-mystic-900/50 p-4 rounded-lg text-sm md:text-base">
            <li>✨ 解锁 紫微斗数、奇门遁甲 高阶排盘</li>
            <li>✨ 解锁 AI 深度面相/手相分析报告</li>
            <li>✨ 解锁 八字合婚万字深度详解</li>
            <li>✨ 无限制测算次数</li>
          </ul>
          <Button fullWidth onClick={handleVipPurchase}>
            立即开通 (¥ 模拟支付)
          </Button>
          <p className="text-xs text-mystic-500">此为演示应用，点击即开通，不产生实际费用。</p>
        </div>
      </Modal>

      <footer className="text-center text-mystic-600 text-xs md:text-sm py-6 md:py-8 border-t border-mystic-800 mt-8 md:mt-12">
        <p>&copy; 2024 玄机 OmniDivination. 命运掌握在自己手中。</p>
        <p className="mt-2 opacity-60">本应用仅供娱乐与文化研究，请相信科学。</p>
      </footer>
    </div>
  );
};

export default App;