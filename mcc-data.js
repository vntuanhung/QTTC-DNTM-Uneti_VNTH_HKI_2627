/* ============================================================
   NGÂN HÀNG ĐỀ VẼ ĐỒ THỊ MCC – v26.05
   Mỗi dòng { ... } là MỘT đề. Đáp án (điểm gãy, WACC từng khoảng)
   được trang mcc.html TỰ TÍNH từ các số liệu dưới đây.

   Ý nghĩa các trường (đơn vị USD; phần trăm ghi dạng số, vd 40 = 40%):
     co     : tên công ty
     wd, wp, we : tỷ trọng vay / CP ưu đãi / CP thường (tổng = 100)
     lims   : các hạn mức vay, vd [300000] hoặc [200000,450000]
     rates  : lãi suất vay, số phần tử = số hạn mức + 1
              vd lims [300000] -> rates [10,12]
     ni     : lãi ròng dự kiến;  dv : cổ tức chia cho cổ đông thường
     P0     : giá CP thường;  D0 : cổ tức năm ngoái;  g : tốc độ tăng cổ tức (%)
     f      : chi phí phát hành CP thường mới (% giá bán)
     Pp, Dp : giá và cổ tức CP ưu đãi
     fp     : chi phí phát hành CPƯĐ (USD/CP), vd [2] hoặc [2,5]
     plim   : mức phát hành CPƯĐ mà vượt qua thì chi phí tăng (null nếu fp chỉ có 1 mức)
   Thuế suất TNDN mặc định 20% (thêm  t: 25  nếu muốn khác).
   Thêm đề mới: chép một dòng, sửa số liệu; các dòng cách nhau bằng dấu phẩy.
   ============================================================ */
window.MCC_BANK = [
  { co: "Công ty CP Xuất nhập khẩu Hải Nghĩa", wd: 40, wp: 20, we: 40, lims: [220000], rates: [7,9], ni: 1100000, dv: 540000, P0: 35, D0: 3, g: 6, f: 12, Pp: 75, Dp: 9, fp: [1.5,3.5], plim: 90000 },
  { co: "Công ty CP Xuất nhập khẩu Việt Nghĩa", wd: 50, wp: 10, we: 40, lims: [360000], rates: [8,10], ni: 850000, dv: 510000, P0: 65, D0: 4.5, g: 5, f: 8, Pp: 75, Dp: 7, fp: [1.5,3], plim: 130000 },
  { co: "Công ty CP Bán lẻ Minh Vượng", wd: 50, wp: 10, we: 40, lims: [240000,460000], rates: [9,12,15], ni: 1100000, dv: 490000, P0: 45, D0: 4.5, g: 4, f: 10, Pp: 50, Dp: 7, fp: [2,5], plim: 140000 },
  { co: "Công ty CP Bán lẻ Nam Thịnh", wd: 30, wp: 20, we: 50, lims: [300000], rates: [8,10], ni: 950000, dv: 350000, P0: 30, D0: 4.5, g: 4, f: 12, Pp: 80, Dp: 5, fp: [1,3], plim: 130000 },
  { co: "Công ty CP Thương mại Hoàng Hưng", wd: 50, wp: 10, we: 40, lims: [220000], rates: [9,11], ni: 1200000, dv: 270000, P0: 40, D0: 3.5, g: 4, f: 8, Pp: 60, Dp: 4, fp: [1.5], plim: null },
  { co: "Công ty CP Bán lẻ Vạn Lộc", wd: 40, wp: 10, we: 50, lims: [140000], rates: [7,10], ni: 700000, dv: 210000, P0: 40, D0: 3.5, g: 7, f: 15, Pp: 55, Dp: 7, fp: [1,4], plim: 110000 },
  { co: "Công ty CP Thương mại Thành Tiến", wd: 40, wp: 20, we: 40, lims: [380000], rates: [7,10], ni: 1100000, dv: 180000, P0: 55, D0: 3, g: 7, f: 10, Pp: 55, Dp: 7, fp: [1.5], plim: null },
  { co: "Công ty CP Thương mại Hải Khang", wd: 40, wp: 10, we: 50, lims: [220000], rates: [9,12], ni: 900000, dv: 330000, P0: 40, D0: 3.5, g: 4, f: 15, Pp: 60, Dp: 6.5, fp: [1.5,4.5], plim: 120000 },
  { co: "Công ty CP Xuất nhập khẩu An Tín", wd: 50, wp: 10, we: 40, lims: [140000], rates: [9,12], ni: 550000, dv: 180000, P0: 40, D0: 4.5, g: 5, f: 15, Pp: 45, Dp: 7, fp: [1.5,4.5], plim: 80000 },
  { co: "Công ty CP Bán lẻ Phúc Đạt", wd: 50, wp: 10, we: 40, lims: [220000], rates: [10,12], ni: 900000, dv: 460000, P0: 50, D0: 2.5, g: 6, f: 10, Pp: 45, Dp: 5, fp: [1], plim: null },
  { co: "Công ty CP Phân phối Sơn Đạt", wd: 40, wp: 20, we: 40, lims: [380000], rates: [8,10], ni: 1050000, dv: 230000, P0: 30, D0: 3.5, g: 5, f: 10, Pp: 75, Dp: 7, fp: [2,4], plim: 90000 },
  { co: "Công ty CP Phân phối Thiên Cường", wd: 40, wp: 10, we: 50, lims: [140000,360000], rates: [7,10,13], ni: 800000, dv: 160000, P0: 65, D0: 3.5, g: 5, f: 10, Pp: 50, Dp: 6, fp: [1.5,3], plim: 50000 },
  { co: "Công ty CP Xuất nhập khẩu Thiên Khang", wd: 30, wp: 20, we: 50, lims: [300000], rates: [9,12], ni: 750000, dv: 410000, P0: 40, D0: 2, g: 7, f: 12, Pp: 60, Dp: 6.5, fp: [1.5,4.5], plim: 120000 },
  { co: "Công ty CP Thương mại Khánh Khang", wd: 40, wp: 20, we: 40, lims: [340000], rates: [10,13], ni: 550000, dv: 160000, P0: 40, D0: 2.5, g: 5, f: 8, Pp: 45, Dp: 5.5, fp: [1,4], plim: 40000 },
  { co: "Công ty CP Xuất nhập khẩu Quang Đạt", wd: 40, wp: 10, we: 50, lims: [400000], rates: [7,10], ni: 1000000, dv: 400000, P0: 35, D0: 4.5, g: 4, f: 15, Pp: 75, Dp: 6, fp: [1.5,4.5], plim: 50000 },
  { co: "Công ty CP Phân phối Khánh Cường", wd: 40, wp: 10, we: 50, lims: [340000], rates: [9,11], ni: 500000, dv: 200000, P0: 55, D0: 3.5, g: 7, f: 8, Pp: 70, Dp: 6.5, fp: [1.5], plim: null },
  { co: "Công ty CP Xuất nhập khẩu Trường Thịnh", wd: 40, wp: 15, we: 45, lims: [280000], rates: [8,10], ni: 550000, dv: 280000, P0: 65, D0: 4.5, g: 4, f: 12, Pp: 50, Dp: 8, fp: [1.5], plim: null },
  { co: "Công ty CP Phân phối Sơn Tín", wd: 50, wp: 10, we: 40, lims: [320000], rates: [9,11], ni: 1150000, dv: 430000, P0: 50, D0: 3, g: 7, f: 8, Pp: 70, Dp: 6, fp: [1,4], plim: 70000 },
  { co: "Công ty CP Phân phối Thiên Phát", wd: 35, wp: 15, we: 50, lims: [280000], rates: [8,11], ni: 650000, dv: 300000, P0: 45, D0: 4.5, g: 4, f: 15, Pp: 65, Dp: 7, fp: [2,3.5], plim: 150000 },
  { co: "Công ty CP Thương mại Nam Tín", wd: 40, wp: 20, we: 40, lims: [380000], rates: [10,12], ni: 1000000, dv: 160000, P0: 45, D0: 3, g: 6, f: 15, Pp: 45, Dp: 4, fp: [2], plim: null },
  { co: "Công ty CP Thương mại Bảo Thịnh", wd: 30, wp: 20, we: 50, lims: [360000], rates: [10,12], ni: 1000000, dv: 330000, P0: 45, D0: 2.5, g: 4, f: 8, Pp: 80, Dp: 4.5, fp: [1,4], plim: 50000 },
  { co: "Công ty CP Bán lẻ An Khang", wd: 40, wp: 15, we: 45, lims: [260000], rates: [8,11], ni: 1000000, dv: 460000, P0: 55, D0: 4.5, g: 5, f: 15, Pp: 60, Dp: 4.5, fp: [2,3.5], plim: 60000 },
  { co: "Công ty CP Xuất nhập khẩu Gia Phát", wd: 50, wp: 10, we: 40, lims: [300000], rates: [9,12], ni: 700000, dv: 330000, P0: 35, D0: 4.5, g: 7, f: 12, Pp: 50, Dp: 4, fp: [2,4], plim: 110000 },
  { co: "Công ty CP Bán lẻ Kim Tiến", wd: 40, wp: 20, we: 40, lims: [120000], rates: [9,11], ni: 500000, dv: 170000, P0: 50, D0: 5, g: 7, f: 10, Pp: 65, Dp: 9, fp: [1], plim: null },
  { co: "Công ty CP Thương mại Phúc Khang", wd: 45, wp: 15, we: 40, lims: [180000], rates: [10,12], ni: 650000, dv: 350000, P0: 45, D0: 4.5, g: 4, f: 12, Pp: 50, Dp: 4.5, fp: [1.5], plim: null },
  { co: "Công ty CP Bán lẻ Hoàng Tiến", wd: 30, wp: 20, we: 50, lims: [120000], rates: [7,9], ni: 1050000, dv: 620000, P0: 50, D0: 3, g: 4, f: 8, Pp: 40, Dp: 5, fp: [1,4], plim: 150000 },
  { co: "Công ty CP Xuất nhập khẩu Quang Long", wd: 40, wp: 10, we: 50, lims: [200000,500000], rates: [10,12,14], ni: 1000000, dv: 540000, P0: 45, D0: 5, g: 4, f: 10, Pp: 50, Dp: 8.5, fp: [2,5], plim: 60000 },
  { co: "Công ty CP Bán lẻ Thiên Đạt", wd: 50, wp: 10, we: 40, lims: [340000], rates: [8,11], ni: 1000000, dv: 460000, P0: 45, D0: 2.5, g: 7, f: 12, Pp: 60, Dp: 7, fp: [1,4], plim: 120000 },
  { co: "Công ty CP Xuất nhập khẩu An Khang", wd: 40, wp: 20, we: 40, lims: [160000], rates: [9,11], ni: 1100000, dv: 290000, P0: 40, D0: 4, g: 6, f: 10, Pp: 55, Dp: 6, fp: [1,2.5], plim: 100000 },
  { co: "Công ty CP Bán lẻ Bảo Tín", wd: 50, wp: 10, we: 40, lims: [280000,440000], rates: [8,11,14], ni: 650000, dv: 220000, P0: 60, D0: 3, g: 4, f: 12, Pp: 50, Dp: 8, fp: [2,5], plim: 80000 },
  { co: "Công ty CP Phân phối Bảo Lộc", wd: 50, wp: 10, we: 40, lims: [220000], rates: [10,13], ni: 750000, dv: 260000, P0: 60, D0: 2, g: 5, f: 10, Pp: 75, Dp: 9, fp: [1,3], plim: 60000 },
  { co: "Công ty CP Thương mại Hoàng Nghĩa", wd: 40, wp: 20, we: 40, lims: [220000,440000], rates: [7,9,11], ni: 1100000, dv: 410000, P0: 45, D0: 2, g: 6, f: 12, Pp: 40, Dp: 5, fp: [2,5], plim: 60000 },
  { co: "Công ty CP Bán lẻ Phúc Thịnh", wd: 50, wp: 5, we: 45, lims: [240000], rates: [7,10], ni: 550000, dv: 280000, P0: 65, D0: 4, g: 4, f: 10, Pp: 80, Dp: 6, fp: [2], plim: null },
  { co: "Công ty CP Phân phối Đông Long", wd: 40, wp: 20, we: 40, lims: [280000], rates: [8,10], ni: 900000, dv: 230000, P0: 60, D0: 3, g: 7, f: 12, Pp: 70, Dp: 8.5, fp: [1,4], plim: 90000 },
  { co: "Công ty CP Thương mại Nam Đạt", wd: 50, wp: 10, we: 40, lims: [300000], rates: [7,9], ni: 1150000, dv: 490000, P0: 70, D0: 5, g: 5, f: 8, Pp: 60, Dp: 7, fp: [1,2.5], plim: 140000 },
  { co: "Công ty CP Thương mại Vạn Đạt", wd: 40, wp: 10, we: 50, lims: [400000], rates: [10,12], ni: 500000, dv: 200000, P0: 60, D0: 2, g: 7, f: 12, Pp: 80, Dp: 9, fp: [1,4], plim: 70000 },
  { co: "Công ty CP Phân phối Trường Cường", wd: 40, wp: 20, we: 40, lims: [360000,660000], rates: [9,11,14], ni: 1050000, dv: 210000, P0: 30, D0: 5, g: 6, f: 15, Pp: 60, Dp: 4, fp: [2,5], plim: 110000 },
  { co: "Công ty CP Xuất nhập khẩu Phúc Nghĩa", wd: 40, wp: 5, we: 55, lims: [320000], rates: [8,10], ni: 1050000, dv: 170000, P0: 50, D0: 5, g: 7, f: 8, Pp: 70, Dp: 7, fp: [1.5,3], plim: 110000 },
  { co: "Công ty CP Xuất nhập khẩu Quang Tiến", wd: 40, wp: 10, we: 50, lims: [180000,280000], rates: [10,13,16], ni: 1200000, dv: 710000, P0: 35, D0: 4, g: 6, f: 15, Pp: 75, Dp: 4, fp: [2,3.5], plim: 90000 },
  { co: "Công ty CP Thương mại Tân Vượng", wd: 50, wp: 10, we: 40, lims: [320000,420000], rates: [8,11,13], ni: 950000, dv: 480000, P0: 45, D0: 2, g: 6, f: 8, Pp: 55, Dp: 8.5, fp: [1,2.5], plim: 70000 },
  { co: "Công ty CP Phân phối Việt Nghĩa", wd: 40, wp: 10, we: 50, lims: [100000], rates: [7,9], ni: 700000, dv: 180000, P0: 30, D0: 5, g: 6, f: 12, Pp: 45, Dp: 7, fp: [1,4], plim: 80000 },
  { co: "Công ty CP Xuất nhập khẩu Ngọc Tiến", wd: 40, wp: 20, we: 40, lims: [300000,580000], rates: [10,12,15], ni: 1050000, dv: 320000, P0: 65, D0: 4.5, g: 6, f: 12, Pp: 45, Dp: 9, fp: [2,5], plim: 100000 },
  { co: "Công ty CP Bán lẻ Quang Khang", wd: 50, wp: 10, we: 40, lims: [220000,420000], rates: [8,10,13], ni: 600000, dv: 290000, P0: 65, D0: 3.5, g: 7, f: 8, Pp: 60, Dp: 5.5, fp: [1.5,3.5], plim: 70000 },
  { co: "Công ty CP Xuất nhập khẩu Thành Đạt", wd: 50, wp: 10, we: 40, lims: [360000], rates: [9,11], ni: 1150000, dv: 540000, P0: 40, D0: 3.5, g: 5, f: 12, Pp: 55, Dp: 9, fp: [1,3], plim: 60000 },
  { co: "Công ty CP Thương mại Phúc Phát", wd: 40, wp: 10, we: 50, lims: [320000], rates: [10,12], ni: 1150000, dv: 280000, P0: 70, D0: 2.5, g: 5, f: 10, Pp: 70, Dp: 8, fp: [1.5,4.5], plim: 140000 },
  { co: "Công ty CP Xuất nhập khẩu Việt Vượng", wd: 40, wp: 10, we: 50, lims: [300000], rates: [9,11], ni: 1100000, dv: 250000, P0: 60, D0: 5, g: 4, f: 10, Pp: 55, Dp: 8.5, fp: [1.5], plim: null },
  { co: "Công ty CP Thương mại An Lộc", wd: 50, wp: 10, we: 40, lims: [160000], rates: [8,11], ni: 550000, dv: 230000, P0: 60, D0: 3, g: 6, f: 8, Pp: 70, Dp: 4.5, fp: [1,4], plim: 130000 },
  { co: "Công ty CP Thương mại Gia Hưng", wd: 40, wp: 20, we: 40, lims: [200000], rates: [8,11], ni: 950000, dv: 470000, P0: 65, D0: 3.5, g: 6, f: 15, Pp: 45, Dp: 8, fp: [1.5,3], plim: 40000 },
  { co: "Công ty CP Phân phối Hoàng Tiến", wd: 50, wp: 5, we: 45, lims: [120000], rates: [7,9], ni: 1100000, dv: 650000, P0: 35, D0: 3, g: 5, f: 15, Pp: 75, Dp: 9, fp: [1,2.5], plim: 90000 },
  { co: "Công ty CP Bán lẻ Đông Nghĩa", wd: 40, wp: 20, we: 40, lims: [200000], rates: [8,11], ni: 950000, dv: 440000, P0: 30, D0: 4, g: 5, f: 12, Pp: 70, Dp: 8.5, fp: [1.5,4.5], plim: 60000 }
];
