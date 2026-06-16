const express = require('express');

const router = express.Router();

// 系统设置，内存存储
let settings = {
  system_name: "金融案件数据录入系统",
  default_court: "",
  output_path: "D:\\输出文书\\",
  paper_size: "A4",
  margin_top: "25mm",
  margin_bottom: "25mm",
  margin_left: "20mm",
  margin_right: "20mm",
  auto_page_number: true,
  excel_format: ".xlsx",
  amount_format: "comma"
};

// 获取系统设置
router.get('/', (req, res) => {
  return res.json({
    code: 200,
    message: 'success',
    data: settings
  });
});

// 更新系统设置
router.put('/', (req, res) => {
  const {
    system_name, default_court, output_path, paper_size,
    margin_top, margin_bottom, margin_left, margin_right,
    auto_page_number, excel_format, amount_format
  } = req.body;

  if (system_name !== undefined) settings.system_name = String(system_name);
  if (default_court !== undefined) settings.default_court = String(default_court);
  if (output_path !== undefined) settings.output_path = String(output_path);
  if (paper_size !== undefined) settings.paper_size = String(paper_size);
  if (margin_top !== undefined) settings.margin_top = String(margin_top);
  if (margin_bottom !== undefined) settings.margin_bottom = String(margin_bottom);
  if (margin_left !== undefined) settings.margin_left = String(margin_left);
  if (margin_right !== undefined) settings.margin_right = String(margin_right);
  if (auto_page_number !== undefined) settings.auto_page_number = Boolean(auto_page_number);
  if (excel_format !== undefined) settings.excel_format = String(excel_format);
  if (amount_format !== undefined) settings.amount_format = String(amount_format);

  return res.json({
    code: 200,
    message: 'success',
    data: settings
  });
});

module.exports = router;
