'use client';

import React, { useState, useEffect } from 'react';

// TypeScript Interfaces
export interface StockItem {
  id: number;
  category: 'พัสดุสำนักงาน' | 'เวชภัณฑ์ที่ไม่ใช่ยา';
  name: string;
  lot: string;
  expire: string;
  count: number;
  unit: string;
  minStock: number;
  auditDate: string;      // YYYY-MM-DD
  nextAuditDate: string;  // YYYY-MM-DD
  auditCycleDays: number; // 7 วันสำหรับเวชภัณฑ์, 14 วันสำหรับพัสดุ
  auditor: string;
}

export interface GroupedStockItem {
  name: string;
  category: 'พัสดุสำนักงาน' | 'เวชภัณฑ์ที่ไม่ใช่ยา';
  unit: string;
  minStock: number;
  totalCount: number;
  lots: StockItem[];
  earliestNextAudit: string;
  latestAuditDate: string;
  auditCycleDays: number;
}

export interface AuditLog {
  id: number;
  itemId: number;
  category: string;
  name: string;
  lot: string;
  expire: string;
  count: number;
  unit: string;
  auditDate: string;
  auditor: string;
  note: string;
}

type UserMode = 'admin' | 'addonly' | 'readonly';
type ActiveTab = 'table' | 'form' | 'history';

const officeSupplies = [
  "กระดาษ A4", "กระดาษ A5", "กระดาษสี", "กาวใส", "คลิปดำ 2 ขา", "ดินสอ", "ดินสอเขียนสไลด์",
  "ทิชชู่", "ถุงขยะติดเชื้อ", "ถ่าน AA 2 ก้อน", "ถ่าน DTX", "ถุงซิปล็อค 10*15", "ถุงซิปล็อค 9*13 (ใหญ่)",
  "ถุงซิปล็อค 9*13 (เล็ก)", "ถุงพลาสติกใส 6*9", "เทปแลคซีน", "เทปใส", "น้ำยาลบคำผิด",
  "ปากกาเคมี", "ปากกาไวท์บอร์ด", "ลวดเย็บกระดาษ No.10", "ลวดเย็บกระดาษ No.8",
  "ลวดเสียบกระดาษ", "หมุด", "สติ๊กเกอร์รับแลป", "สมุดรับแลป", "Cable tie", "Safety Box"
];

const medicalSupplies = [
  "DISPOSIBLE SYRINGE 3 C.C.", "DISPOSIBLE SYRINGE 5 CC.", "DISPOSIBLE SYRINGE 10 CC.",
  "Isolation Grown Lamonate 26 gms. (กาวน์กันน้ำ)", "Ethyl Alcohol gel 70% ล้างมือ",
  "Latex tube (สายรัดแขนเจาะเลือด)", "ACCU-Check guie (Strip DTX)", "Tensoplast (พลาสเตอร์ปิดแผล)",
  "Water less เช็ดโต๊ะ (75%Alcohol)", "เข็มเจาะปลายนิ้ว สำหรับตรวจหาระดับน้ำตาล",
  "Surgical Mask N95 แบบคล้องหู", "MASK DISPOSSEBLE (แมสเขียว)", "MICROPORE 3M 1\" X10 yds.",
  "TRANSPORE 3 M. 1/2\"X10 yds.", "ผ้าก๊อสพับ 3x3\" 8 ชั้น (ก๊อสเช็ดโต๊ะ)",
  "DISPOSIBLE NEEDLE NO.21x1\"", "DISPOSIBLE NEEDLE NO.22x1.5\"", "DISPOSIBLE NEEDLE NO.23x1.5\"",
  "DISPOSIBLE NEEDLE NO.24x1.5\"", "หมวก DISPOSSEBLE (หมวกเขียว)", "IV.FLUID 0.9% NSS (100ML)",
  "IV.FLUID STERILE WATER FOR INJ. (100ML.)", "STERILE WATER FOR IRRIGATION (500ML)",
  "NORMAL SALINE 500 CC. (IRRIGATE)", "GLOVE NO.S (DISPOS.)", "Leg and cover Health Medic",
  "ALCOHOL BLISTER PACK (1แผงบรรจุ10ก้อน)", "ALCOHOL BLISTER PACK (1แผงบรรจุ8ก้อน)",
  "สำลีก้อน ขนาด 1.40 กรัม (บรรจุ 450 กรัม)", "VIRULEX 5 GM. (MONOPERSULFATE)",
  "AROMATIC AMMONIA SPIRIT(30ML)", "BETADINE SOLUTION 15 ML.", "พลาสเตอร์ผ้ากาวเหนียว EEG",
  "Stop Bleed", "ขวด Hemoculture", "กระป๋อง Sterile", "Pus Culture", "Stool Culture"
];

const todayStr = new Date().toISOString().split('T')[0];

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const initialStockData: StockItem[] = [
  {
    id: 1,
    category: "เวชภัณฑ์ที่ไม่ใช่ยา",
    name: "DISPOSIBLE NEEDLE NO.21x1\"",
    lot: "25H08",
    expire: "2030-07-31",
    count: 2,
    unit: "กล่อง",
    minStock: 5,
    auditDate: "2026-10-28",
    nextAuditDate: addDays("2026-10-28", 7),
    auditCycleDays: 7,
    auditor: "Sau Patt"
  },
  {
    id: 2,
    category: "เวชภัณฑ์ที่ไม่ใช่ยา",
    name: "DISPOSIBLE NEEDLE NO.21x1\"",
    lot: "25D04",
    expire: "2030-03-31",
    count: 1,
    unit: "กล่อง",
    minStock: 5,
    auditDate: "2026-10-28",
    nextAuditDate: addDays("2026-10-28", 7),
    auditCycleDays: 7,
    auditor: "Sau Patt"
  },
  {
    id: 3,
    category: "เวชภัณฑ์ที่ไม่ใช่ยา",
    name: "Stop Bleed",
    lot: "285/69",
    expire: "2027-03-21",
    count: 5,
    unit: "กล่อง",
    minStock: 10,
    auditDate: "2026-09-21",
    nextAuditDate: addDays("2026-09-21", 7),
    auditCycleDays: 7,
    auditor: "เจ้าหน้าที่ A"
  },
  {
    id: 4,
    category: "พัสดุสำนักงาน",
    name: "Safety Box",
    lot: "-",
    expire: "-",
    count: 4,
    unit: "กล่อง",
    minStock: 5,
    auditDate: "2026-09-10",
    nextAuditDate: addDays("2026-09-10", 14),
    auditCycleDays: 14,
    auditor: "เจ้าหน้าที่ B"
  }
];

const initialAuditHistory: AuditLog[] = [
  {
    id: 101,
    itemId: 1,
    category: "เวชภัณฑ์ที่ไม่ใช่ยา",
    name: "DISPOSIBLE NEEDLE NO.21x1\"",
    lot: "25H08",
    expire: "2030-07-31",
    count: 2,
    unit: "กล่อง",
    auditDate: "2026-10-28",
    auditor: "Sau Patt",
    note: "นับสต็อกประจำสัปดาห์"
  }
];

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');
  const [userMode, setUserMode] = useState<UserMode>('admin');

  // Master Data
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Expanded Group Rows
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState({
    category: "พัสดุสำนักงาน" as 'พัสดุสำนักงาน' | 'เวชภัณฑ์ที่ไม่ใช่ยา',
    item: officeSupplies[0],
    customName: '',
    lot: '',
    count: '',
    unit: 'กล่อง',
    minStock: '5',
    expDate: '',
    auditDate: todayStr,
    auditor: '',
    note: ''
  });

  // Filter States - Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทุกประเภท');
  const [auditDueFilter, setAuditDueFilter] = useState<boolean>(false);

  // Filter States - History
  const [historyCategory, setHistoryCategory] = useState('ทุกประเภท');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Load Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') as UserMode;
      if (mode === 'readonly') {
        setUserMode('readonly');
        setActiveTab('table');
      } else if (mode === 'addonly') {
        setUserMode('addonly');
        setActiveTab('form');
      } else {
        setUserMode('admin');
      }
    }

    const savedStock = localStorage.getItem('labstock_data_v3');
    const savedHistory = localStorage.getItem('labstock_history_v3');

    if (savedStock) {
      try { setStockList(JSON.parse(savedStock)); } catch { setStockList(initialStockData); }
    } else {
      setStockList(initialStockData);
    }

    if (savedHistory) {
      try { setAuditHistory(JSON.parse(savedHistory)); } catch { setAuditHistory(initialAuditHistory); }
    } else {
      setAuditHistory(initialAuditHistory);
    }

    setIsLoaded(true);
  }, []);

  // Save Data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('labstock_data_v3', JSON.stringify(stockList));
      localStorage.setItem('labstock_history_v3', JSON.stringify(auditHistory));
    }
  }, [stockList, auditHistory, isLoaded]);

  // Toggle Row Group Details
  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Compute Status
  const getAuditStatus = (nextAuditDate: string) => {
    if (!nextAuditDate) return { label: 'ปกติ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', code: 'OK' };
    
    const today = new Date(todayStr).getTime();
    const nextDate = new Date(nextAuditDate).getTime();
    const diffDays = Math.ceil((nextDate - today) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { label: `เกินกำหนด (${Math.abs(diffDays)} วัน)`, color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', code: 'OVERDUE' };
    } else if (diffDays === 0) {
      return { label: 'ถึงกำหนดนับวันนี้', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', code: 'DUE_TODAY' };
    } else if (diffDays <= 2) {
      return { label: `ใกล้ถึงกำหนด (อีก ${diffDays} วัน)`, color: 'bg-amber-50 text-amber-800 border-amber-200', code: 'DUE_SOON' };
    }
    return { label: 'ปกติ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', code: 'OK' };
  };

  // Submit Audit Form
  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userMode === 'readonly') return;

    if (!formData.count || Number(formData.count) < 0) {
      alert('กรุณากรอกจำนวนให้ถูกต้อง');
      return;
    }

    const itemName = formData.item === 'อื่นๆ (ระบุเอง)' ? formData.customName : formData.item;
    if (!itemName.trim()) {
      alert('กรุณาระบุชื่อรายการ');
      return;
    }

    const cycleDays = formData.category === 'เวชภัณฑ์ที่ไม่ใช่ยา' ? 7 : 14;
    const auditDateInput = formData.auditDate || todayStr;
    const nextAudit = addDays(auditDateInput, cycleDays);
    const countNum = Number(formData.count);
    const minStockNum = Number(formData.minStock) || 0;
    const lotInput = formData.lot.trim() || '-';

    // Check existing exact Item + Lot
    const existingIndex = stockList.findIndex(
      (item) => item.name.trim().toLowerCase() === itemName.trim().toLowerCase() && 
                item.lot.trim().toLowerCase() === lotInput.toLowerCase()
    );

    let updatedList = [...stockList];
    let targetItemId: number;

    if (existingIndex >= 0) {
      targetItemId = stockList[existingIndex].id;
      updatedList[existingIndex] = {
        ...stockList[existingIndex],
        category: formData.category,
        expire: formData.expDate || stockList[existingIndex].expire || '-',
        count: countNum,
        unit: formData.unit || stockList[existingIndex].unit || 'หน่วย',
        minStock: minStockNum,
        auditDate: auditDateInput,
        nextAuditDate: nextAudit,
        auditCycleDays: cycleDays,
        auditor: formData.auditor.trim() || 'เจ้าหน้าที่'
      };
    } else {
      targetItemId = Date.now();
      const newItem: StockItem = {
        id: targetItemId,
        category: formData.category,
        name: itemName.trim(),
        lot: lotInput,
        expire: formData.expDate || '-',
        count: countNum,
        unit: formData.unit || 'หน่วย',
        minStock: minStockNum,
        auditDate: auditDateInput,
        nextAuditDate: nextAudit,
        auditCycleDays: cycleDays,
        auditor: formData.auditor.trim() || 'เจ้าหน้าที่'
      };
      updatedList = [newItem, ...updatedList];
    }

    // Record History Log
    const newLog: AuditLog = {
      id: Date.now(),
      itemId: targetItemId,
      category: formData.category,
      name: itemName.trim(),
      lot: lotInput,
      expire: formData.expDate || '-',
      count: countNum,
      unit: formData.unit || 'หน่วย',
      auditDate: auditDateInput,
      auditor: formData.auditor.trim() || 'เจ้าหน้าที่',
      note: formData.note.trim() || `บันทึก Audit รอบ ${cycleDays} วัน`
    };

    setStockList(updatedList);
    setAuditHistory([newLog, ...auditHistory]);

    alert('✅ บันทึกผล Audit และสร้าง Snapshot ประวัติย้อนหลังเรียบร้อยแล้ว!');

    setFormData({
      ...formData,
      lot: '',
      count: '',
      expDate: '',
      note: ''
    });

    if (userMode !== 'addonly') {
      setActiveTab('table');
    }
  };

  // Delete Stock Item
  const handleDelete = (id: number) => {
    if (userMode !== 'admin') return;
    if (confirm('คุณต้องการลบรายการ Lot นี้ใช่หรือไม่?')) {
      setStockList(stockList.filter((item) => item.id !== id));
    }
  };

  // Quick Audit
  const handleQuickAudit = (item: StockItem) => {
    const newCount = prompt(`ระบุจำนวนคงเหลือใหม่สำหรับ "${item.name}" (Lot: ${item.lot}):`, item.count.toString());
    if (newCount !== null && newCount.trim() !== '' && !isNaN(Number(newCount))) {
      const countNum = Number(newCount);
      const auditDateInput = todayStr;
      const nextAudit = addDays(auditDateInput, item.auditCycleDays);

      const updated = stockList.map((st) => 
        st.id === item.id 
          ? { ...st, count: countNum, auditDate: auditDateInput, nextAuditDate: nextAudit } 
          : st
      );

      const newLog: AuditLog = {
        id: Date.now(),
        itemId: item.id,
        category: item.category,
        name: item.name,
        lot: item.lot,
        expire: item.expire,
        count: countNum,
        unit: item.unit,
        auditDate: auditDateInput,
        auditor: 'เจ้าหน้าที่ (Quick Audit)',
        note: `Quick Audit อัปเดตยอดคงเหลือเป็น ${countNum}`
      };

      setStockList(updated);
      setAuditHistory([newLog, ...auditHistory]);
      alert('✅ อัปเดตการ Audit เรียบร้อยแล้ว!');
    }
  };

  // Save Modal Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const cycleDays = editingItem.category === 'เวชภัณฑ์ที่ไม่ใช่ยา' ? 7 : 14;
    const nextAudit = addDays(editingItem.auditDate, cycleDays);

    const updatedItem = {
      ...editingItem,
      auditCycleDays: cycleDays,
      nextAuditDate: nextAudit
    };

    setStockList(stockList.map((item) => (item.id === editingItem.id ? updatedItem : item)));
    setEditingItem(null);
    alert('✅ แก้ไขข้อมูลรายการเรียบร้อยแล้ว!');
  };

  // Export History CSV
  const exportHistoryCSV = () => {
    if (filteredHistory.length === 0) {
      alert('ไม่มีข้อมูลประวัติให้ส่งออก');
      return;
    }

    const headers = ['ลำดับ', 'วันที่ Audit', 'ประเภท', 'รายการ', 'Lot Number', 'วันหมดอายุ', 'จำนวน', 'หน่วยนับ', 'ผู้ตรวจนับ', 'หมายเหตุ'];
    const rows = filteredHistory.map((log, index) => [
      index + 1,
      log.auditDate,
      `"${log.category}"`,
      `"${log.name}"`,
      `"${log.lot}"`,
      log.expire,
      log.count,
      `"${log.unit}"`,
      `"${log.auditor}"`,
      `"${log.note}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_History_${selectedMonth || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group Stock Items by Name
  const groupedData: GroupedStockItem[] = React.useMemo(() => {
    const map = new Map<string, StockItem[]>();

    stockList.forEach((item) => {
      const cleanCategory = selectedCategory === 'ทุกประเภท' || item.category === selectedCategory;
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(cleanSearch) || item.lot.toLowerCase().includes(cleanSearch);

      if (cleanCategory && matchesSearch) {
        const key = item.name.trim();
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(item);
      }
    });

    const result: GroupedStockItem[] = [];

    map.forEach((items, name) => {
      const first = items[0];
      const totalCount = items.reduce((sum, i) => sum + i.count, 0);
      
      // Sort nextAuditDate ascending to find earliest due
      const sortedByNextAudit = [...items].sort((a, b) => a.nextAuditDate.localeCompare(b.nextAuditDate));
      const earliestNextAudit = sortedByNextAudit[0]?.nextAuditDate || todayStr;

      // Sort auditDate descending for latest audit
      const sortedByAuditDate = [...items].sort((a, b) => b.auditDate.localeCompare(a.auditDate));
      const latestAuditDate = sortedByAuditDate[0]?.auditDate || todayStr;

      result.push({
        name,
        category: first.category,
        unit: first.unit,
        minStock: first.minStock,
        totalCount,
        lots: items,
        earliestNextAudit,
        latestAuditDate,
        auditCycleDays: first.auditCycleDays
      });
    });

    if (auditDueFilter) {
      return result.filter(g => {
        const status = getAuditStatus(g.earliestNextAudit).code;
        return status === 'OVERDUE' || status === 'DUE_TODAY';
      });
    }

    return result;
  }, [stockList, selectedCategory, searchTerm, auditDueFilter]);

  // Filtering History Log Data
  const filteredHistory = auditHistory.filter((log) => {
    const matchesCategory = historyCategory === 'ทุกประเภท' || log.category === historyCategory;
    const cleanSearch = historySearch.trim().toLowerCase();
    const matchesSearch = log.name.toLowerCase().includes(cleanSearch) || log.lot.toLowerCase().includes(cleanSearch) || log.auditor.toLowerCase().includes(cleanSearch);
    const matchesMonth = selectedMonth ? log.auditDate.startsWith(selectedMonth) : true;
    return matchesCategory && matchesSearch && matchesMonth;
  });

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Navigation & Header Bar */}
        <header className="rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-800 p-5 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-wider">LABSTOCK</h1>
              <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 font-bold uppercase">
                v2.5 Grouped Lot View
              </span>
            </div>
            <p className="text-xs text-violet-100/90 mt-1 flex items-center gap-2 flex-wrap">
              <span>ระบบบริหารจัดการสต็อกพัสดุและเวชภัณฑ์</span>
              <span className="opacity-40">•</span>
              <span className="bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
                เวชภัณฑ์: รอบ 7 วัน
              </span>
              <span className="bg-blue-400/20 text-blue-200 px-2 py-0.5 rounded text-[10px] font-medium">
                พัสดุ: รอบ 14 วัน
              </span>
            </p>
          </div>

          <div className="flex bg-slate-900/40 backdrop-blur-md p-1.5 rounded-xl border border-white/20 flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'table' 
                  ? 'bg-white text-violet-900 shadow-sm' 
                  : 'text-violet-100 hover:bg-white/10'
              }`}
            >
              <span>📊</span> สต็อกคงเหลือ
            </button>

            {userMode !== 'readonly' && (
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'form' 
                    ? 'bg-white text-violet-900 shadow-sm' 
                    : 'text-violet-100 hover:bg-white/10'
                }`}
              >
                <span>📝</span> บันทึก Audit Stock
              </button>
            )}

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'history' 
                  ? 'bg-white text-violet-900 shadow-sm' 
                  : 'text-violet-100 hover:bg-white/10'
              }`}
            >
              <span>📜</span> ประวัติการ Audit ย้อนหลัง
            </button>
          </div>
        </header>

        {/* ================= หน้าที่ 1: ตารางสต็อกสินค้าคงเหลือ (GROUPED LOT VIEW) ================= */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            
            {/* Action & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between gap-4 items-stretch lg:items-center">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option>ทุกประเภท</option>
                  <option>พัสดุสำนักงาน</option>
                  <option>เวชภัณฑ์ที่ไม่ใช่ยา</option>
                </select>

                <input 
                  type="text"
                  placeholder="🔍 ค้นหารายการ หรือ เลข Lot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Quick Filter Status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuditDueFilter(!auditDueFilter)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    auditDueFilter 
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>⚠️</span> ดูเฉพาะรายการที่ถึง/เกินกำหนดนับ
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">ประเภท</th>
                      <th className="p-4">รายการ (รวม Lot)</th>
                      <th className="p-4 text-center">จำนวน Lot</th>
                      <th className="p-4 text-center">คงเหลือรวม</th>
                      <th className="p-4 text-center">มินิมั่ม (MIN)</th>
                      <th className="p-4">AUDIT ล่าสุด</th>
                      <th className="p-4">กำหนด AUDIT ถัดไป</th>
                      <th className="p-4 text-center">สถานะการ AUDIT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedData.length > 0 ? (
                      groupedData.map((group, idx) => {
                        const auditStatus = getAuditStatus(group.earliestNextAudit);
                        const isLowStock = group.totalCount <= group.minStock;
                        const isExpanded = !!expandedGroups[group.name];

                        return (
                          <React.Fragment key={idx}>
                            {/* Group Header Row */}
                            <tr 
                              onClick={() => toggleGroupExpand(group.name)}
                              className={`hover:bg-slate-50/90 transition cursor-pointer select-none ${
                                isExpanded ? 'bg-violet-50/40' : ''
                              }`}
                            >
                              <td className="p-4 text-center">
                                <button className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px]">
                                  {isExpanded ? '▼' : '▶'}
                                </button>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  group.category === 'พัสดุสำนักงาน' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}>
                                  {group.category}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                                  <span>{group.name}</span>
                                </div>
                                {isLowStock && (
                                  <span className="inline-block mt-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                                    ⚠️ สต็อกใกล้หมด (ต่ำกว่า Min)
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center font-bold text-slate-600">
                                <span className="bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 font-mono">
                                  {group.lots.length} ล็อต
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                                  isLowStock ? 'text-amber-700 bg-amber-50' : 'text-indigo-600 bg-indigo-50'
                                }`}>
                                  {group.totalCount} <span className="text-xs font-normal text-slate-500">{group.unit}</span>
                                </span>
                              </td>
                              <td className="p-4 text-center text-slate-400 font-medium">
                                {group.minStock} {group.unit}
                              </td>
                              <td className="p-4 font-mono text-slate-600">
                                {group.latestAuditDate}
                              </td>
                              <td className="p-4 font-mono font-semibold text-slate-700">
                                {group.earliestNextAudit}
                                <div className="text-[10px] text-slate-400 font-normal">
                                  รอบทุก {group.auditCycleDays} วัน
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-block ${auditStatus.color}`}>
                                  {auditStatus.label}
                                </span>
                              </td>
                            </tr>

                            {/* Sub-table: Expandable Lots Details */}
                            {isExpanded && (
                              <tr className="bg-slate-50/70 border-b border-violet-100">
                                <td colSpan={9} className="p-3 pl-12">
                                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-inner space-y-2">
                                    <div className="text-xs font-bold text-violet-900 flex justify-between items-center border-b pb-2">
                                      <span>📦 รายละเอียด Lot ย่อยของ "{group.name}"</span>
                                      <span className="text-[10px] text-slate-400 font-normal">คลิก Quick Audit เพื่ออัปเดตยอดแยกตาม Lot ได้ทันที</span>
                                    </div>
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                                          <th className="py-2 px-3">Lot Number</th>
                                          <th className="py-2 px-3">วันหมดอายุ</th>
                                          <th className="py-2 px-3 text-center">คงเหลือ</th>
                                          <th className="py-2 px-3">Audit ล่าสุด</th>
                                          <th className="py-2 px-3">ผู้ตรวจนับ</th>
                                          {userMode === 'admin' && <th className="py-2 px-3 text-center">จัดการ</th>}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {group.lots.map((lotItem) => (
                                          <tr key={lotItem.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                                              {lotItem.lot}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-500">
                                              {lotItem.expire}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold text-indigo-600">
                                              {lotItem.count} {lotItem.unit}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-500">
                                              {lotItem.auditDate}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600">
                                              {lotItem.auditor}
                                            </td>
                                            {userMode === 'admin' && (
                                              <td className="py-2.5 px-3 text-center space-x-1 whitespace-nowrap">
                                                <button 
                                                  onClick={() => handleQuickAudit(lotItem)}
                                                  className="text-indigo-600 hover:text-indigo-900 font-bold text-[11px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                                                >
                                                  ⚡ Audit
                                                </button>
                                                <button 
                                                  onClick={() => setEditingItem(lotItem)}
                                                  className="text-amber-600 hover:text-amber-800 font-semibold text-[11px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200"
                                                >
                                                  แก้ไข
                                                </button>
                                                <button 
                                                  onClick={() => handleDelete(lotItem.id)}
                                                  className="text-rose-500 hover:text-rose-700 font-semibold text-[11px] px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200"
                                                >
                                                  ลบ
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-400">
                          <div className="text-2xl mb-1">🔍</div>
                          ไม่พบรายการอุปกรณ์หรือพัสดุที่ตรงกับเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= หน้าที่ 2: ฟอร์มบันทึก AUDIT ================= */}
        {activeTab === 'form' && userMode !== 'readonly' && (
          <div className="max-w-3xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center border-b pb-4 mb-6 border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
                  <span>📝</span> บันทึกผล Audit Stock
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เมื่อบันทึกแล้ว ระบบจะอัปเดตยอดสต็อกคงเหลือ และบันทึก Snapshot ประวัติย้อนหลังให้อัตโนมัติ
                </p>
              </div>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmitAudit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">หมวดหมู่</label>
                  <select 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-semibold"
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as 'พัสดุสำนักงาน' | 'เวชภัณฑ์ที่ไม่ใช่ยา';
                      setFormData({
                        ...formData, 
                        category: cat,
                        item: cat === 'พัสดุสำนักงาน' ? officeSupplies[0] : medicalSupplies[0]
                      });
                    }}
                  >
                    <option value="พัสดุสำนักงาน">พัสดุสำนักงาน (รอบนับทุก 14 วัน)</option>
                    <option value="เวชภัณฑ์ที่ไม่ใช่ยา">เวชภัณฑ์ที่ไม่ใช่ยา (รอบนับทุก 7 วัน)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">รายการอุปกรณ์</label>
                  <select 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                  >
                    {(formData.category === 'พัสดุสำนักงาน' ? officeSupplies : medicalSupplies).map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                    <option value="อื่นๆ (ระบุเอง)">อื่นๆ (ระบุเอง)...</option>
                  </select>
                </div>
              </div>

              {formData.item === 'อื่นๆ (ระบุเอง)' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ระบุชื่อรายการใหม่</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น แอลกอฮอล์ก้อน 500g"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={formData.customName}
                    onChange={(e) => setFormData({...formData, customName: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">เลขล็อต (Lot Number)</label>
                  <input 
                    type="text" 
                    placeholder="เช่น 25H08 / 25D04" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
                    value={formData.lot}
                    onChange={(e) => setFormData({...formData, lot: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">จำนวนที่นับได้จริง *</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-bold text-indigo-700"
                    value={formData.count}
                    onChange={(e) => setFormData({...formData, count: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">หน่วยนับ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น กล่อง, ชิ้น, รีม, ขวด" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    สต็อกขั้นต่ำ (Min Stock)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-medium"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    วันหมดอายุ (EXP)
                  </label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
                    value={formData.expDate}
                    onChange={(e) => setFormData({...formData, expDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">วันที่ Audit</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
                    value={formData.auditDate}
                    onChange={(e) => setFormData({...formData, auditDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อผู้ตรวจนับ / Auditor</label>
                  <input 
                    type="text" 
                    placeholder="เช่น Sau Patt / คุณกานต์" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={formData.auditor}
                    onChange={(e) => setFormData({...formData, auditor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">หมายเหตุ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ตรวจนับประจำสัปดาห์" 
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full rounded-xl bg-violet-600 py-3.5 text-white font-bold hover:bg-violet-700 transition shadow-md shadow-violet-200 mt-4 text-sm"
              >
                💾 บันทึกการ Audit และอัปเดตสต็อก
              </button>
            </form>
          </div>
        )}

        {/* ================= หน้าที่ 3: ประวัติการ AUDIT ย้อนหลัง (AUDIT LOGS) ================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* History Filters & Export Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-3 items-stretch md:items-center">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <select 
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option>ทุกประเภท</option>
                  <option>พัสดุสำนักงาน</option>
                  <option>เวชภัณฑ์ที่ไม่ใช่ยา</option>
                </select>

                <input 
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                <input 
                  type="text"
                  placeholder="🔍 ค้นหาในประวัติ (ชื่อ, Lot, ผู้ตรวจ)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <button
                onClick={exportHistoryCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>📥</span> Export CSV / Excel
              </button>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-600">
                  📜 ประวัติการตรวจนับทั้งหมด ({filteredHistory.length} รายการ)
                </span>
                {selectedMonth && (
                  <button 
                    onClick={() => setSelectedMonth('')}
                    className="text-xs text-violet-600 hover:underline font-medium"
                  >
                    ล้างตัวกรองเดือน
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                      <th className="p-4">วันที่ Audit</th>
                      <th className="p-4">หมวดหมู่</th>
                      <th className="p-4">รายการ</th>
                      <th className="p-4">Lot Number</th>
                      <th className="p-4">วันหมดอายุ</th>
                      <th className="p-4 text-center">ยอดคงเหลือที่นับได้</th>
                      <th className="p-4">ผู้ตรวจนับ</th>
                      <th className="p-4">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-slate-700">{log.auditDate}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-indigo-700">{log.name}</td>
                          <td className="p-4 font-mono text-slate-600">{log.lot}</td>
                          <td className="p-4 text-slate-500 font-mono">{log.expire}</td>
                          <td className="p-4 text-center font-bold text-slate-800 text-sm">
                            {log.count} <span className="text-xs font-normal text-slate-500">{log.unit}</span>
                          </td>
                          <td className="p-4 font-medium text-slate-700">{log.auditor}</td>
                          <td className="p-4 text-slate-500 italic">{log.note || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400">
                          ไม่พบประวัติการ Audit ย้อนหลังที่ตรงกับเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= MODAL สำหรับแก้ไขข้อมูล (POPUP) ================= */}
        {editingItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-bold text-slate-800">✏️ แก้ไขข้อมูลพัสดุ / เวชภัณฑ์</h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">รายการ</label>
                  <input 
                    type="text" 
                    value={editingItem.name} 
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">เลขล็อต (Lot)</label>
                    <input 
                      type="text" 
                      value={editingItem.lot} 
                      onChange={(e) => setEditingItem({ ...editingItem, lot: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">วันหมดอายุ (EXP)</label>
                    <input 
                      type="text" 
                      value={editingItem.expire} 
                      onChange={(e) => setEditingItem({ ...editingItem, expire: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">คงเหลือ</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={editingItem.count} 
                      onChange={(e) => setEditingItem({ ...editingItem, count: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-violet-400 text-indigo-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">หน่วยนับ</label>
                    <input 
                      type="text" 
                      value={editingItem.unit} 
                      onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Min Stock</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingItem.minStock} 
                      onChange={(e) => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">วันที่ Audit ล่าสุด</label>
                  <input 
                    type="date" 
                    value={editingItem.auditDate} 
                    onChange={(e) => setEditingItem({ ...editingItem, auditDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition"
                  >
                    บันทึกแก้ไข
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}