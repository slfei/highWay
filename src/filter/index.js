import dayjs from 'dayjs'

export function formatDate (time, format) {
  if (!time) {
    return ''
  }
  return dayjs(time).format(format)
}
// 浮点类型相乘
// 第一个参数：原本数据， 第二个参数：需要相乘的倍数
export function computeRate (a = 0, b = 0) {
  let c = 0
  // 修复a或b为null的情况
  a = a || 0
  b = b || 0
  let d = a.toString()
  let e = b.toString()
  try {
    c += d.split('.')[1].length
  // eslint-disable-next-line no-empty
  } catch (f) {}
  try {
    c += e.split('.')[1].length
  // eslint-disable-next-line no-empty
  } catch (f) {}
  return (Number(d.replace('.', '')) * Number(e.replace('.', ''))) / Math.pow(10, c)
}
// 浮点类型相除
// 第一个参数：原本数据， 第二个参数：需要相除的倍数
export function computeDiv (a = 0, b = 0) {
  let c
  let d
  let e = 0
  let f = 0
  try {
    e = a.toString().split('.')[1].length
  } catch (g) {
    e = 0
  }
  try {
    f = b.toString().split('.')[1].length
  } catch (g) {
    f = 0
  }
  c = Number(a.toString().replace('.', ''))
  d = Number(b.toString().replace('.', ''))
  return computeRate(c / d, Math.pow(10, f - e))
}
// 浮点类型相加
// 第一个参数：原本数据， 第二个参数：需要相加的倍数
export function computeAdd (a = 0, b = 0) {
  let c, d, e
  try {
    c = a.toString().split('.')[1].length
  } catch (f) {
    c = 0
  }
  try {
    d = b.toString().split('.')[1].length
  } catch (f) {
    d = 0
  }
  e = Math.pow(10, Math.max(c, d))
  return (computeRate(a, e) + computeRate(b, e)) / e
}
// 浮点类型相减
// 第一个参数：原本数据， 第二个参数：需要相减的倍数
export function computeSub (a = 0, b = 0) {
  let c, d, e
  try {
    c = a.toString().split('.')[1].length
  } catch (f) {
    c = 0
  }
  try {
    d = b.toString().split('.')[1].length
  } catch (f) {
    d = 0
  }
  e = Math.pow(10, Math.max(c, d))
  return (computeRate(a, e) - computeRate(b, e)) / e
}
// 金额数字转为中午大写
export function smalltoBIG (n) {
  let fraction = ['角', '分']
  let digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  let unit = [ ['元', '万', '亿'], ['', '拾', '佰', '仟'] ]
  let head = n < 0 ? '欠' : ''
  n = Math.abs(n)
  let s = ''
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '')
  }
  s = s || '整'
  n = Math.floor(n)

  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p
      n = Math.floor(n / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }
  return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整')
}
// 特殊菜单名称剪切规则
export function sliceMenuName (data) {
  if (data.indexOf('%-%') > 0) {
    return data.slice(0, data.indexOf('%-%'))
  }
  return data
}
export function isNull (o) {
  return o === null || o === void 0
}
// 格式化money
export const formatterPrice = function (val, cancelFixed) {
  if (isNull(val) || isNaN(val)) return
  let USPrice = Number.parseFloat(val).toLocaleString()
  let lastDot = USPrice.toString().indexOf('.')
  // 完全是整数, 需要添加小数点
  if (lastDot === -1 && !cancelFixed) {
    USPrice += '.000'
  }
  // 返回数据是一位小数，用0补齐为两位小数
  if (USPrice.toString().substring(lastDot + 1).length === 1 && !cancelFixed) {
    USPrice += '00'
  }
  if (USPrice.toString().substring(lastDot + 1).length === 2 && !cancelFixed) {
    USPrice += '0'
  }
  if (USPrice.toString().substring(lastDot + 1).length === 3 && !cancelFixed) {
    USPrice += ''
  }
  return USPrice
}
