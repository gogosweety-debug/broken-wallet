import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Search, 
  Download, 
  Edit3, 
  ZoomOut, 
  Heart, 
  Package, 
  X, 
  History
} from 'lucide-react';

// 預設 Banner 圖片 (質感橫幅)
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop";

// 初始預設資料
const INITIAL_ITEMS = [
  {
    id: '1',
    name: '劉宇寧《朝暮》巡迴演唱會限定周邊禮盒',
    price: 3200,
    isPriceUnknown: false,
    currency: 'TWD',
    platform: '小魚',
    status: 'shipping',
    date: '2025-05-10',
    trackingNo: 'SF1394029481',
    warehouse: '巧巧郎',
    deliveryMethod: 'express',
    logisticsStatus: '已發貨',
    unlockedAt: '2025-05-15'
  },
  {
    id: '2',
    name: '復古底片感照相機 (寧哥同款)',
    price: 450,
    isPriceUnknown: false,
    currency: 'RMB',
    platform: '小魚',
    status: 'wishlist',
    date: '2025-05-12',
    trackingNo: '',
    warehouse: '',
    deliveryMethod: 'express',
    logisticsStatus: '未發貨',
    unlockedAt: null
  },
  {
    id: '3',
    name: '法式香氛蠟燭 - 破曉玫瑰',
    price: 0,
    isPriceUnknown: true,
    currency: 'TWD',
    platform: '小魚',
    status: 'wishlist',
    date: '2025-04-20',
    trackingNo: '',
    warehouse: '',
    deliveryMethod: 'express',
    logisticsStatus: '未發貨',
    unlockedAt: null
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wallet_broke_items');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  // 自訂匯率 state (預設 4.5)
  const [rmbRate, setRmbRate] = useState(() => {
    return Number(localStorage.getItem('wallet_broke_rmb_rate')) || 4.5;
  });

  const [bannerImg, setBannerImg] = useState(() => {
    return localStorage.getItem('wallet_broke_banner') || DEFAULT_BANNER;
  });
  const [bannerTitle, setBannerTitle] = useState(() => {
    return localStorage.getItem('wallet_broke_title') || '破荷包備忘 💸';
  });
  const [bannerSubtitle, setBannerSubtitle] = useState(() => {
    return localStorage.getItem('wallet_broke_subtitle') || '理性消費，為愛買單 ✨ 劉宇寧特別應援專屬帳本';
  });
  const [isEditingSlogan, setIsEditingSlogan] = useState(false);

  // Modal 狀態
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    isPriceUnknown: false,
    currency: 'TWD',
    platform: '小魚',
    deliveryMethod: 'express',
    trackingNo: '',
    warehouse: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('wallet_broke_items', JSON.stringify(items));
    } catch (e) {
      console.warn("Storage warning", e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('wallet_broke_banner', bannerImg);
    } catch (e) {
      console.warn("Banner save warning", e);
    }
  }, [bannerImg]);

  useEffect(() => {
    localStorage.setItem('wallet_broke_title', bannerTitle);
    localStorage.setItem('wallet_broke_subtitle', bannerSubtitle);
  }, [bannerTitle, bannerSubtitle]);

  useEffect(() => {
    localStorage.setItem('wallet_broke_rmb_rate', rmbRate.toString());
  }, [rmbRate]);

  // 上傳 Banner 與裁切處理
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedBanner = () => {
    if (!tempImageSrc) return;

    const img = new Image();
    img.src = tempImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const targetWidth = 1280;
      const targetHeight = 720;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.fillStyle = '#FFF9F3';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const aspect = img.width / img.height;
      let drawWidth = targetWidth * zoom;
      let drawHeight = (targetWidth / aspect) * zoom;

      const offsetX = (targetWidth - drawWidth) / 2 + pan.x * 2;
      const offsetY = (targetHeight - drawHeight) / 2 + pan.y * 2;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      setBannerImg(compressedBase64);
      setCropModalOpen(false);
      setTempImageSrc(null);
    };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  // 匯出為 Excel 相容的 CSV 檔案
  const handleExportExcel = () => {
    const headers = ['日期', '物品名稱', '金額', '幣別', '金額待補', '購買平台', '目前狀態', '運送方式', '物流單號', '集運倉備註', '歷史結案日期'];
    
    const rows = items.map(item => [
      item.date || '',
      `"${(item.name || '').replace(/"/g, '""')}"`,
      item.isPriceUnknown ? '金額待補' : item.price,
      item.currency || 'TWD',
      item.isPriceUnknown ? '是' : '否',
      `"${(item.platform || '').replace(/"/g, '""')}"`,
      item.status === 'wishlist' ? '未付款' : item.status === 'shipping' ? '已付款/配送中' : '歷史結案',
      item.deliveryMethod === 'faceToFace' ? '面交 / 親提' : '快遞集運',
      `"${(item.trackingNo || '').replace(/"/g, '""')}"`,
      `"${(item.warehouse || '').replace(/"/g, '""')}"`,
      item.unlockedAt || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `破荷包備忘_購物清單_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || (!newItem.isPriceUnknown && newItem.price === '')) return;
    
    const currentLogisticsStatus = newItem.deliveryMethod === 'faceToFace'
      ? '面交待確認'
      : (newItem.trackingNo && newItem.trackingNo.trim() !== '' ? '已發貨' : '未發貨');

    if (editingItem) {
      setItems(items.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: newItem.name,
            price: newItem.isPriceUnknown ? 0 : Number(newItem.price),
            isPriceUnknown: newItem.isPriceUnknown,
            currency: newItem.currency || 'TWD',
            platform: newItem.platform || '小魚',
            deliveryMethod: newItem.deliveryMethod || 'express',
            trackingNo: newItem.deliveryMethod === 'faceToFace' ? '' : (newItem.trackingNo || ''),
            warehouse: newItem.deliveryMethod === 'faceToFace' ? '' : (newItem.warehouse || ''),
            logisticsStatus: currentLogisticsStatus,
            date: newItem.date || new Date().toISOString().slice(0, 10)
          };
        }
        return item;
      }));
      setEditingItem(null);
    } else {
      const item = {
        id: Date.now().toString(),
        name: newItem.name,
        price: newItem.isPriceUnknown ? 0 : Number(newItem.price),
        isPriceUnknown: newItem.isPriceUnknown,
        currency: newItem.currency || 'TWD',
        platform: newItem.platform || '小魚',
        status: 'wishlist',
        date: newItem.date || new Date().toISOString().slice(0, 10),
        deliveryMethod: newItem.deliveryMethod || 'express',
        trackingNo: newItem.deliveryMethod === 'faceToFace' ? '' : (newItem.trackingNo || ''),
        warehouse: newItem.deliveryMethod === 'faceToFace' ? '' : (newItem.warehouse || ''),
        logisticsStatus: currentLogisticsStatus,
        unlockedAt: null
      };
      setItems([item, ...items]);
    }

    setItemModalOpen(false);
    setNewItem({
      name: '',
      price: '',
      isPriceUnknown: false,
      currency: 'TWD',
      platform: '小魚',
      deliveryMethod: 'express',
      trackingNo: '',
      warehouse: '',
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      price: item.isPriceUnknown ? '' : item.price,
      isPriceUnknown: item.isPriceUnknown || false,
      currency: item.currency || 'TWD',
      platform: item.platform || '小魚',
      deliveryMethod: item.deliveryMethod || 'express',
      trackingNo: item.trackingNo || '',
      warehouse: item.warehouse || '',
      date: item.date || new Date().toISOString().slice(0, 10)
    });
    setItemModalOpen(true);
  };

  const updateItemStatus = (id, newStatus) => {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCompleteItem = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'completed',
          unlockedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return item;
    }));
  };

  const formatMoney = (price, currency = 'TWD', isPriceUnknown = false) => {
    if (isPriceUnknown) return '金額待補';
    const symbol = currency === 'RMB' ? '¥' : 'NT$';
    return `${symbol} ${Number(price).toLocaleString()}`;
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#FFF9F3] text-gray-800 font-sans pb-24 sm:pb-8">
      {/* 頂部 Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-rose-100 px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB7B2] to-[#FF9AA2] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-base sm:text-lg text-gray-800 tracking-tight">破荷包備忘 💸</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-xl border border-rose-100 text-[11px] font-bold text-rose-600">
              <span>RMB 匯率:</span>
              <input
                type="number"
                step="0.01"
                value={rmbRate}
                onChange={(e) => setRmbRate(parseFloat(e.target.value) || 0)}
                className="w-12 text-center bg-white border border-rose-200 rounded-md py-0.5 text-xs text-gray-800 focus:outline-none"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 p-2 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition shadow-2xs text-xs font-bold"
              title="下載 Excel 報表"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">下載 Excel</span>
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setNewItem({
                  name: '',
                  price: '',
                  isPriceUnknown: false,
                  currency: 'TWD',
                  platform: '小魚',
                  deliveryMethod: 'express',
                  trackingNo: '',
                  warehouse: '',
                  date: new Date().toISOString().slice(0, 10)
                });
                setItemModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white font-bold text-xs shadow-xs hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              買買買
            </button>
          </div>
        </div>
      </header>

      <main className="w-full pb-4 space-y-5">
        {/* Banner 區域 - 100% 滿版 */}
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-rose-100 shadow-sm border-b border-rose-200 group">
          <img
            src={bannerImg}
            alt="Custom Banner"
            className="w-full h-full object-cover transition duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-6 text-white max-w-4xl mx-auto">
            <div className="flex justify-end gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-200">
              <label className="flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white text-gray-800 text-xs font-bold rounded-xl backdrop-blur-md cursor-pointer transition shadow-xs">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>換圖</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <button
                onClick={() => setBannerImg(DEFAULT_BANNER)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white text-gray-800 text-xs font-bold rounded-xl backdrop-blur-md transition shadow-xs"
                title="恢復預設"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>預設</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/30 text-rose-100">
                  CUSTOM BANNER
                </span>
              </div>

              {isEditingSlogan ? (
                <div className="space-y-2 mt-2 bg-black/40 p-3 rounded-2xl backdrop-blur-md">
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full text-base font-bold bg-white/20 border border-white/40 rounded-lg px-2 py-1 text-white focus:outline-none"
                    placeholder="標題..."
                  />
                  <input
                    type="text"
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    className="w-full text-xs bg-white/20 border border-white/40 rounded-lg px-2 py-1 text-white/90 focus:outline-none"
                    placeholder="副標題..."
                  />
                  <button
                    onClick={() => setIsEditingSlogan(false)}
                    className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition"
                  >
                    儲存標語
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingSlogan(true)} 
                  className="cursor-pointer group/title hover:opacity-90 transition"
                  title="點擊修改標題與標語"
                >
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    {bannerTitle}
                    <Edit3 className="w-4 h-4 opacity-0 group-hover/title:opacity-100 transition text-rose-300" />
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-100/90 font-medium max-w-xl line-clamp-1">
                    {bannerSubtitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 主要內容區域 */}
        <div className="max-w-4xl mx-auto px-4 space-y-5">
          {/* 桌面端導覽頁籤 */}
          <div className="hidden sm:flex bg-rose-50/60 p-1 rounded-2xl border border-rose-100">
            {[
              { id: 'home', label: '總覽主頁', icon: Sparkles },
              { id: 'wishlist', label: '未付款', icon: ShoppingBag },
              { id: 'logistics', label: '已付款', icon: Truck },
              { id: 'collection', label: '歷史', icon: History }
            ].map(tab => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-rose-600 shadow-2xs border border-rose-100'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-rose-500' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div>
            {activeTab === 'home' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* 已付款 */}
                  <div className="bg-white p-5 rounded-3xl border border-rose-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-rose-500" />
                        已付款項目
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {items.filter(i => i.status === 'shipping').length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">目前沒有已付款的項目～</p>
                      ) : (
                        items.filter(i => i.status === 'shipping').map(item => (
                          <div 
                            key={item.id} 
                            className="p-3 rounded-2xl bg-[#FFF9F3] border border-rose-100 flex items-center justify-between cursor-pointer hover:border-rose-300 transition group"
                            onClick={() => handleEditItem(item)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-bold text-gray-800 truncate group-hover:text-rose-500 transition">{item.name}</p>
                                  <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                </div>
                                <p className="text-[10px] text-gray-400">
                                  📅 {item.date} • {formatMoney(item.price, item.currency, item.isPriceUnknown)} • {item.platform}
                                  {item.deliveryMethod === 'faceToFace' ? ' (面交)' : item.trackingNo ? ` (${item.trackingNo})` : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteItem(item.id);
                              }}
                              className="px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shrink-0 ml-2 shadow-2xs"
                            >
                              {item.deliveryMethod === 'faceToFace' ? '完成面交' : '簽收結案'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 未付款 */}
                  <div className="bg-white p-5 rounded-3xl border border-rose-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        未付款
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {items.filter(i => i.status === 'wishlist').slice(0, 4).map(item => (
                        <div 
                          key={item.id} 
                          className="p-3 rounded-2xl bg-[#FFF9F3] border border-rose-100 flex items-center justify-between cursor-pointer hover:border-rose-300 transition group"
                          onClick={() => handleEditItem(item)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-bold text-gray-800 truncate group-hover:text-rose-500 transition">{item.name}</p>
                                <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                              </div>
                              <p className="text-[10px] text-gray-400">📅 {item.date} • {formatMoney(item.price, item.currency, item.isPriceUnknown)} • {item.platform}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemStatus(item.id, 'shipping');
                            }}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white text-xs font-bold hover:opacity-90 transition shrink-0 ml-2"
                          >
                            轉為已付款
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-rose-500" />
                    未付款清單
                  </h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="搜尋備忘物品..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-rose-200 bg-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.filter(i => i.status === 'wishlist').map(item => (
                    <div key={item.id} className="bg-white rounded-3xl border border-rose-100 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium mb-0.5">📅 {item.date}</p>
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">{item.name}</h4>
                        <p className="text-xs font-black text-rose-500 mb-2">
                          {formatMoney(item.price, item.currency, item.isPriceUnknown)}
                        </p>
                        <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-semibold">
                          {item.platform}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                          title="編輯"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus(item.id, 'shipping')}
                          className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white font-bold text-xs hover:opacity-95 transition"
                        >
                          轉為已付款
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-rose-500" />
                  已付款與配送進度
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.filter(i => i.status === 'shipping').map(item => (
                    <div key={item.id} className="bg-white rounded-3xl border border-rose-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400">{item.platform}</span>
                        {item.deliveryMethod === 'faceToFace' ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🤝 面交 / 親提</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            {item.trackingNo ? `單號: ${item.trackingNo}` : '⚠️ 尚未填寫單號'}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-gray-800">{item.name}</h4>
                      
                      {item.deliveryMethod !== 'faceToFace' && item.warehouse && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">🏠 集運倉：{item.warehouse}</p>
                      )}

                      <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {item.deliveryMethod === 'faceToFace' ? '面交待確認' : item.logisticsStatus}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 py-1 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold hover:bg-amber-100 transition flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          編輯單號/資料
                        </button>
                        <button
                          onClick={() => handleCompleteItem(item.id)}
                          className="flex-1 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
                        >
                          {item.deliveryMethod === 'faceToFace' ? '完成面交' : '簽收結案'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'collection' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-rose-500" />
                  歷史紀錄
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.filter(i => i.status === 'completed').map(item => (
                    <div key={item.id} className="bg-white rounded-3xl border border-rose-100 p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 mb-2">購買金額: {formatMoney(item.price, item.currency, item.isPriceUnknown)} ({item.platform})</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-rose-50 pt-2">
                        <span className="text-[10px] text-gray-400">結案日期: {item.unlockedAt || '已簽收'}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">歷史已入庫</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 手機端固定底部選單 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 px-2 py-2 flex items-center justify-around shadow-lg">
        {[
          { id: 'home', label: '主頁', icon: Sparkles },
          { id: 'wishlist', label: '未付款', icon: ShoppingBag },
          { id: 'logistics', label: '已付款', icon: Truck },
          { id: 'collection', label: '歷史', icon: History }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-rose-600 font-black scale-105'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-gray-400'}`} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 新增/編輯品項 Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-rose-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-gray-800">
                {editingItem ? '編輯備忘品項' : '新增購物願望'}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">日期</label>
                <input
                  type="date"
                  required
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">物品名稱</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="請輸入名稱..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600">金額</label>
                  <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.isPriceUnknown}
                      onChange={(e) => setNewItem({ ...newItem, isPriceUnknown: e.target.checked })}
                      className="accent-rose-500 rounded"
                    />
                    <span>未知待補</span>
                  </label>
                </div>

                {!newItem.isPriceUnknown && (
                  <div className="flex gap-2">
                    <select
                      value={newItem.currency}
                      onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                      className="px-2 py-2 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50 text-rose-600 focus:outline-none"
                    >
                      <option value="TWD">NT$</option>
                      <option value="RMB">¥ (RMB)</option>
                    </select>
                    <input
                      type="number"
                      required={!newItem.isPriceUnknown}
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="請輸入價格..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">購買平台</label>
                <input
                  type="text"
                  value={newItem.platform}
                  onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                  placeholder="例如：小魚、淘寶、微店"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* 僅在編輯已付款品項時顯示運送方式物流選項 */}
              {editingItem && editingItem.status !== 'wishlist' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">運送方式</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, deliveryMethod: 'express' })}
                      className={`py-1.5 px-3 text-xs rounded-xl font-bold border transition ${
                        newItem.deliveryMethod !== 'faceToFace'
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      📦 快遞集運
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, deliveryMethod: 'faceToFace' })}
                      className={`py-1.5 px-3 text-xs rounded-xl font-bold border transition ${
                        newItem.deliveryMethod === 'faceToFace'
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      🤝 面交 / 親提
                    </button>
                  </div>

                  {newItem.deliveryMethod !== 'faceToFace' && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={newItem.trackingNo}
                        onChange={(e) => setNewItem({ ...newItem, trackingNo: e.target.value })}
                        placeholder="貨運單號 (填寫後自動標示為已發貨)"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                      />
                      <input
                        type="text"
                        value={newItem.warehouse}
                        onChange={(e) => setNewItem({ ...newItem, warehouse: e.target.value })}
                        placeholder="集運倉備註 (如：巧巧郎、聖龍、官集)"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-[#FFFDF8] focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white font-bold text-xs shadow-sm hover:opacity-95 transition mt-2"
              >
                {editingItem ? '儲存修改' : '加入購物備忘'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner 裁切與縮放 Modal */}
      {cropModalOpen && tempImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                調整 Banner 圖片範圍
              </h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className="relative w-full aspect-[16/9] bg-gray-900 rounded-2xl overflow-hidden cursor-move touch-none flex items-center justify-center select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              <img
                src={tempImageSrc}
                alt="Crop preview"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                className="pointer-events-none transition-transform duration-75"
              />
              <div className="absolute inset-0 border-2 border-white/40 pointer-events-none rounded-2xl flex items-center justify-center">
                <span className="text-[10px] bg-black/50 text-white/80 px-2 py-0.5 rounded-full">
                  可按住拖曳或使用下方滑桿縮放
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><ZoomOut className="w-3.5 h-3.5" /> 縮放</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-rose-100">
              <button
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-rose-200 text-xs font-bold text-gray-600 hover:bg-rose-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveCroppedBanner}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white text-xs font-bold shadow-xs hover:opacity-95 transition"
              >
                套用並儲存
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
