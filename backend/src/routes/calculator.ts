import express from 'express';

const router = express.Router();

// 诉讼费计算（中国法院标准）
function calculateLitigationFee(amount: number, caseType: string, nonPropertyType?: string, halfFee?: boolean, waiver?: boolean): { fee: number; details: string } {
  let fee = 0;

  if (caseType === 'nonProperty') {
    // 非财产案件
    switch (nonPropertyType) {
      case 'divorce':
        fee = 300;
        break;
      case 'labor':
        fee = 10;
        break;
      case 'personality':
        fee = 500;
        break;
      case 'intellectual':
        fee = 500;
        break;
      default:
        fee = 80;
    }
  } else {
    // 财产案件，按标的额分段累计交纳
    if (amount <= 10000) {
      fee = 50;
    } else if (amount <= 100000) {
      fee = amount * 0.025 - 200;
    } else if (amount <= 200000) {
      fee = amount * 0.02 + 300;
    } else if (amount <= 500000) {
      fee = amount * 0.015 + 1300;
    } else if (amount <= 1000000) {
      fee = amount * 0.01 + 3800;
    } else if (amount <= 2000000) {
      fee = amount * 0.009 + 4800;
    } else if (amount <= 5000000) {
      fee = amount * 0.008 + 6800;
    } else if (amount <= 10000000) {
      fee = amount * 0.007 + 11800;
    } else if (amount <= 20000000) {
      fee = amount * 0.006 + 21800;
    } else {
      fee = amount * 0.005 + 41800;
    }
  }

  // 减半收取
  if (halfFee) {
    fee = fee / 2;
  }

  // 免交
  if (waiver) {
    fee = 0;
  }

  fee = Math.round(fee * 100) / 100;

  const details = caseType === 'nonProperty'
    ? `非财产案件，案件类型：${nonPropertyType || '其他'}，诉讼费：${fee}元${halfFee ? '（减半收取）' : ''}${waiver ? '（免交）' : ''}`
    : `财产案件，标的额：${amount}元，诉讼费：${fee}元${halfFee ? '（减半收取）' : ''}${waiver ? '（免交）' : ''}`;

  return { fee, details };
}

// 计算两个日期之间的天数
function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 诉讼费计算
router.post('/fee', (req, res) => {
  const { amount, caseType, nonPropertyType, halfFee, waiver } = req.body;

  if (caseType === 'property' && (amount === undefined || amount === null)) {
    return res.status(400).json({
      code: 400,
      message: '标的金额不能为空',
      data: null
    });
  }

  const result = calculateLitigationFee(
    Number(amount) || 0,
    caseType || 'property',
    nonPropertyType,
    halfFee,
    waiver
  );

  return res.json({
    code: 200,
    message: 'success',
    data: result
  });
});

// 利息计算
router.post('/interest', (req, res) => {
  const { principal, rateValue, rateType, calcMethod, startDate, endDate } = req.body;

  if (!principal || !rateValue || !startDate || !endDate) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const days = getDaysBetween(startDate, endDate);

  // 将利率转换为年利率
  let yearRate = Number(rateValue);
  if (rateType === 'month') {
    yearRate = yearRate * 12;
  } else if (rateType === 'day') {
    yearRate = yearRate * 365;
  }

  // 计算利息
  const interest = Number(principal) * yearRate / 100 / 365 * days;
  const roundedInterest = Math.round(interest * 100) / 100;

  const details = `本金：${principal}元，年利率：${(yearRate).toFixed(4)}%，天数：${days}天，利息：${roundedInterest}元`;

  return res.json({
    code: 200,
    message: 'success',
    data: {
      interest: roundedInterest,
      days,
      details
    }
  });
});

// 罚息计算
router.post('/penalty', (req, res) => {
  const { principal, contractRate, rateMode, fixedRate, overdueStart, overdueEnd } = req.body;

  if (!principal || !contractRate || !overdueStart || !overdueEnd) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const days = getDaysBetween(overdueStart, overdueEnd);

  // 计算上浮后的罚息利率
  let penaltyRate = Number(contractRate);
  let rateDesc = '';
  switch (rateMode) {
    case '1.3':
      penaltyRate = Number(contractRate) * 1.3;
      rateDesc = '上浮30%';
      break;
    case '1.5':
      penaltyRate = Number(contractRate) * 1.5;
      rateDesc = '上浮50%';
      break;
    case '2':
      penaltyRate = Number(contractRate) * 2;
      rateDesc = '上浮100%';
      break;
    case 'fixed':
      penaltyRate = Number(fixedRate || contractRate);
      rateDesc = `固定利率${penaltyRate}%`;
      break;
    default:
      penaltyRate = Number(contractRate) * 1.5;
      rateDesc = '上浮50%（默认）';
  }

  // 罚息 = 逾期本金 × 罚息利率 / 365 × 逾期天数
  const penaltyInterest = Number(principal) * penaltyRate / 100 / 365 * days;
  const roundedPenaltyInterest = Math.round(penaltyInterest * 100) / 100;

  const details = `逾期本金：${principal}元，合同利率：${contractRate}%，罚息利率：${penaltyRate.toFixed(4)}%（${rateDesc}），逾期天数：${days}天，罚息：${roundedPenaltyInterest}元`;

  return res.json({
    code: 200,
    message: 'success',
    data: {
      penaltyInterest: roundedPenaltyInterest,
      days,
      details
    }
  });
});

// 复利计算
router.post('/compound', (req, res) => {
  const { principal, baseInterest, compoundRate, startDate, endDate, method, period } = req.body;

  if (!principal || !baseInterest || !compoundRate || !startDate || !endDate) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const totalDays = getDaysBetween(startDate, endDate);

  let compoundInterest = 0;
  let details = '';

  if (method === 'simple') {
    // 单利方式计算复利
    compoundInterest = Number(baseInterest) * Number(compoundRate) / 100 / 365 * totalDays;
    details = `基础利息：${baseInterest}元，复利利率：${compoundRate}%，天数：${totalDays}天（单利方式）`;
  } else {
    // 复利方式：按周期计算
    let periodDays = 365;
    if (period === 'month') {
      periodDays = 30;
    } else if (period === 'quarter') {
      periodDays = 90;
    } else if (period === 'year') {
      periodDays = 365;
    }

    const periods = totalDays / periodDays;
    const rate = Number(compoundRate) / 100;
    compoundInterest = Number(baseInterest) * (Math.pow(1 + rate / (365 / periodDays), totalDays / periodDays * (365 / periodDays)) - 1);

    // 简化计算：按周期数复利
    compoundInterest = Number(baseInterest) * (Math.pow(1 + rate, periods) - 1);
    details = `基础利息：${baseInterest}元，复利利率：${compoundRate}%，总天数：${totalDays}天，计算周期：${period === 'month' ? '按月' : period === 'quarter' ? '按季' : '按年'}，期数：${periods.toFixed(2)}`;
  }

  const roundedCompoundInterest = Math.round(compoundInterest * 100) / 100;
  details += `，复利：${roundedCompoundInterest}元`;

  return res.json({
    code: 200,
    message: 'success',
    data: {
      compoundInterest: roundedCompoundInterest,
      details
    }
  });
});

// 违约金计算
router.post('/breach', (req, res) => {
  const { basis, baseAmount, contractRatio, interestAmount, interestMultiple, fixedAmount, lossAmount, startDay, endDay } = req.body;

  let amount = 0;
  let details = '';

  switch (basis) {
    case 'contractRatio': {
      // 按合同比例计算
      const base = Number(baseAmount || 0);
      const ratio = Number(contractRatio || 0);
      amount = base * ratio / 100;
      details = `计算基数：${base}元，合同比例：${ratio}%，违约金：${amount}元`;
      break;
    }
    case 'interestMultiple': {
      // 按利息倍数计算
      const interest = Number(interestAmount || 0);
      const multiple = Number(interestMultiple || 1);
      amount = interest * multiple;
      details = `利息金额：${interest}元，倍数：${multiple}倍，违约金：${amount}元`;
      break;
    }
    case 'fixed': {
      // 固定金额
      amount = Number(fixedAmount || 0);
      details = `固定违约金：${amount}元`;
      break;
    }
    case 'loss': {
      // 按损失计算
      amount = Number(lossAmount || 0);
      details = `损失金额：${amount}元`;
      break;
    }
    case 'daily': {
      // 按日计算
      const base = Number(baseAmount || 0);
      const ratio = Number(contractRatio || 0);
      const days = (startDay && endDay) ? getDaysBetween(startDay, endDay) : 0;
      amount = base * ratio / 100 / 365 * days;
      details = `计算基数：${base}元，日利率：${ratio}%/365，天数：${days}天，违约金：${amount}元`;
      break;
    }
    default: {
      amount = 0;
      details = '未指定计算方式';
    }
  }

  const roundedAmount = Math.round(amount * 100) / 100;

  return res.json({
    code: 200,
    message: 'success',
    data: {
      amount: roundedAmount,
      details
    }
  });
});

export default router;
