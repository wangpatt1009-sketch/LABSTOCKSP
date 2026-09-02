'use client';
import { useState } from 'react';

// รายการพัสดุสำนักงาน 23 รายการ
const officeSupplies = [
  'กระดาษ A4', 'กระดาษ A5', 'กระดาษสี', 'กาวใส', 'คลิปดำ 2 ขา', 'ดินสอ', 'ดินสอเขียนสไลด์',
  'ถ่าน AA 2 ก้อน', 'ถ่าน DTX', 'ถุงซิปล็อค 10*15', 'ถุงซิปล็อค 9*13 (ใหญ่)',
  'ถุงซิปล็อค 9*13 (เล็ก)', 'ถุงพลาสติกใส 6*9', 'เทปแลคซีน', 'เทปใส', 'น้ำยาลบคำผิด',
  'ปากกาเคมี', 'ปากกาไวท์บอร์ด', 'ลวดเย็บกระดาษ No.10', 'ลวดเย็บกระดาษ No.8',
  'ลวดเสียบกระดาษ', 'หมุด', 'สติ๊กเกอร์รับแลป', 'Cable tie'
];

// รายการเวชภัณฑ์ที่ไม่ใช่ยา 33 รายการ
const medicalSupplies = [
  'DISPOSIBLE SYRINGE 3 C.C.', 'DISPOSIBLE SYRINGE 5 CC.', 'DISPOSIBLE SYRINGE 10 CC.',
  'Isolation Grown Lamonate 26 gms. (กาวน์กันน้ำ)', 'Ethyl Alcohol gel 70% ล้างมือ',
  'Latex tube (สายรัดแขนเจาะเลือด)', 'ACCU-Check guie (Strip DTX)', 'Tensoplast (พลาสเตอร์ปิดแผล)',
  'Water less เช็ดโต๊ะ (75%Alcohol)', 'เข็มเจาะปลายนิ้ว สำหรับตรวจหาระดับน้ำตาล',
  'Surgical Mask N95 แบบคล้องหู', 'MASK DISPOSSEBLE (แมสเขียว)', 'MICROPORE 3M 1" X10 yds.',
  'TRANSPORE 3 M. 1/2"X10 yds.', 'ผ้าก๊อสพับ 3x3" 8 ชั้น (ก๊อสเช็ดโต๊ะ)',
  'DISPOSIBLE NEEDLE NO.21x1"', 'DISPOSIBLE NEEDLE NO.22x1.5"', 'DISPOSIBLE NEEDLE NO.23x1.5"',
  'DISPOSIBLE NEEDLE NO.24x1.5"', 'หมวก DISPOSSEBLE (หมวกเขียว)', 'IV.FLUID 0.9% NSS (100ML)',
  'IV.FLUID STERILE WATER FOR INJ. (100ML.)', 'STERILE WATER FOR IRRIGATION (500ML)',
  'NORMAL SALINE 500 CC. (IRRIGATE)', 'GLOVE NO.S (DISPOS.)', 'Leg and cover Health Medic',
  'ALCOHOL BLISTER PACK (1แผงบรรจุ10ก้อน)', 'ALCOHOL BLISTER PACK (1แผงบรรจุ8ก้อน)',
  'สำลีก้อน ขนาด 1.40 กรัม (บรรจุ 450 กรัม)', 'VIRULEX 5 GM. (MONOPERSULFATE)',
  'AROMATIC AMMONIA SPIRIT(30ML)', 'BETADINE SOLUTION 15 ML.', 'พลาสเตอร์ผ้ากาวเหนียว EEG'
];

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<'form' | 'table'>('form');

  // เพิ่ม lot Number ใน state ของฟอร์ม
  const [formData, setFormData] = useState({
    category: 'พัสดุสำนักงาน',
    item: 'กระดาษ A4',
    lot: '',
    count: '',
    expDate: '',
    auditDate: '2026-09-01',
  });

  const [stockList, setStockList] = useState([
    { id: 1, category: 'พัสดุสำนักงาน', name: 'กระดาษ A4', lot: 'LOT-6901', expire: '-', count: 55, unit: 'รีม', status: 'ปกติ' },
    { id: 2, category: 'เวชภัณฑ์ที่ไม่ใช่ยา', name: 'DISPOSIBLE SYRINGE 3 C.C.', lot: '77744UN25', expire: '2026-11-06', count: 2, unit: 'กล่อง', status: 'ใกล้หมดอายุ' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทุกประเภท');

  // ฟังก์ชันกดบันทึกแล้วนำข้อมูลไปเพิ่มในตารางสต็อก
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.count) {
      alert('กรุณากรอกจำนวนที่นับได้จริง');
      return;
    }

    const newItem = {
      id: Date.now(),
      category: formData.category,
      name: formData.item,
      lot: formData.lot || '-',
      expire: formData.expDate || '-',
      count: Number(formData.count),
      unit: 'หน่วย',
      status: 'ปกติ'
    };

    setStockList([newItem, ...stockList]);
    alert('✅ บันทึกผล Audit และอัปเดตสต็อกเรียบร้อยแล้ว!');

    // ล้างค่าฟอร์มบางส่วน
    setFormData({
      ...formData,
      lot: '',
      count: '',
      expDate: ''
    });
  };

  const filteredData = stockList.filter((item) => {
    const matchesCategory = selectedCategory === 'ทุกประเภท' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.lot.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Navigation & Header Bar */}
        <header className="rounded-2xl bg-violet-300 p-5 text-teal-950 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-teal-300/50">
          <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-white">LABSTOCK</h1>
            <p className="text-xs opacity-80 mt-1">ระบบบริหารจัดการสต็อกพัสดุและเวชภัณฑ์</p>
          </div>

          <div className="flex bg-teal-300/50 p-1 rounded-xl border border-teal-400/30">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'form' 
                  ? 'bg-white text-teal-900 shadow-sm' 
                  : 'text-teal-900/70 hover:text-teal-950'
              }`}
            >
              📝 บันทึก Audit Stock
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'table' 
                  ? 'bg-white text-teal-900 shadow-sm' 
                  : 'text-teal-900/70 hover:text-teal-950'
              }`}
            >
              📊 ตารางสต็อกคงเหลือ
            </button>
          </div>
        </header>

        {/* ================= หน้าที่ 1: ฟอร์มบันทึก AUDIT (เพิ่ม Lot & Exp) ================= */}
        {activeTab === 'form' && (
          <div className="max-w-2xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="mb-6 text-xl font-bold text-pink-500 flex items-center gap-2 border-b pb-3 border-slate-100">
              <span>📝</span> บันทึกผล Audit Stock
            </h2>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">หมวดหมู่</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setFormData({
                      ...formData, 
                      category: cat,
                      item: cat === 'พัสดุสำนักงาน' ? officeSupplies[0] : medicalSupplies[0]
                    });
                  }}
                >
                  <option>พัสดุสำนักงาน</option>
                  <option>เวชภัณฑ์ที่ไม่ใช่ยา</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">รายการอุปกรณ์</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                >
                  {formData.category === 'พัสดุสำนักงาน'
                    ? officeSupplies.map((item, idx) => <option key={idx}>{item}</option>)
                    : medicalSupplies.map((item, idx) => <option key={idx}>{item}</option>)
                  }
                </select>
              </div>

              {/* เพิ่มช่อง Lot Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">เลขล็อต (Lot Number)</label>
                <input 
                  type="text" 
                  placeholder="เช่น LOT-6901 / 77744UN25" 
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300 font-mono"
                  value={formData.lot}
                  onChange={(e) => setFormData({...formData, lot: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">จำนวนที่นับได้จริง</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  required
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={formData.count}
                  onChange={(e) => setFormData({...formData, count: e.target.value})}
                />
              </div>

              {/* ปรับให้เปิดใส่ Exp Date ได้ตามต้องการ */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  วันหมดอายุ (EXP) <span className="text-slate-400 font-normal">(ถ้าไม่มีให้เว้นว่างได้)</span>
                </label>
                <input 
                  type="date" 
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={formData.expDate}
                  onChange={(e) => setFormData({...formData, expDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">วันที่ Audit ล่าสุด</label>
                <input 
                  type="date" 
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={formData.auditDate}
                  onChange={(e) => setFormData({...formData, auditDate: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full rounded-xl bg-pink-500 py-4 text-white font-bold hover:bg-pink-600 transition shadow-md shadow-pink-100 mt-4 text-base"
              >
                บันทึกการ Audit
              </button>
            </form>
          </div>
        )}

        {/* ================= หน้าที่ 2: ตารางสต็อกสินค้าคงเหลือ ================= */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  <option>ทุกประเภท</option>
                  <option>พัสดุสำนักงาน</option>
                  <option>เวชภัณฑ์ที่ไม่ใช่ยา</option>
                </select>

                <input 
                  type="text"
                  placeholder="ค้นหารายการ หรือ เลข Lot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 font-semibold uppercase">
                      <th className="p-4">ประเภท</th>
                      <th className="p-4">รายการ</th>
                      <th className="p-4">Lot Number</th>
                      <th className="p-4">Expire</th>
                      <th className="p-4 text-center">คงเหลือ</th>
                      <th className="p-4">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-500">{item.category}</td>
                        <td className="p-4 font-bold text-indigo-600">{item.name}</td>
                        <td className="p-4 text-slate-600 font-mono font-semibold">{item.lot}</td>
                        <td className="p-4 text-slate-500">{item.expire}</td>
                        <td className="p-4 text-center font-bold text-indigo-600 text-sm">{item.count}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                            item.status === 'ปกติ' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}