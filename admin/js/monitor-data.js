/**
 * 监控系统模拟数据
 */

/**
 * 获取重点数据
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @returns {Array} 重点数据数组
 */
function getKeyData(system = 'ems', device = 'local') {
    // 基于系统和设备类型返回不同的重点数据
    if (device === 'local') {
        return [
            { name: '系统运行状态', value: '正常运行', unit: '' },
            { name: '控制模式', value: '自动控制', unit: '' },
            { name: '当前功率', value: '+1.26', unit: 'MW' },
            { name: '总电量', value: '12.8', unit: 'MWh' },
            { name: '电池SOC', value: '79.5', unit: '%' },
            { name: '系统SOH', value: '98', unit: '%' },
            { name: '运行时间', value: '342', unit: 'h' },
            { name: '充电次数', value: '26', unit: '次' }
        ];
    } else if (device === 'bms') {
        return [
            { name: '电池状态', value: '充电中', unit: '' },
            { name: '电池SOC', value: '79.5', unit: '%' },
            { name: '电池SOH', value: '98', unit: '%' },
            { name: '电池温度', value: '28.3', unit: '°C' },
            { name: '最高单体电压', value: '3.75', unit: 'V' },
            { name: '最低单体电压', value: '3.63', unit: 'V' },
            { name: '电压差', value: '0.12', unit: 'V' },
            { name: '温度差', value: '2.5', unit: '°C' }
        ];
    } else if (device === 'pcs') {
        return [
            { name: 'PCS状态', value: '运行', unit: '' },
            { name: '运行模式', value: '并网', unit: '' },
            { name: '有功功率', value: '+1.26', unit: 'MW' },
            { name: '无功功率', value: '0.12', unit: 'MVar' },
            { name: '电网频率', value: '50.02', unit: 'Hz' },
            { name: 'A相电压', value: '230.5', unit: 'V' },
            { name: 'A相电流', value: '1825', unit: 'A' },
            { name: '变流器温度', value: '42.6', unit: '°C' }
        ];
    } else if (device === 'thermal') {
        return [
            { name: '制冷状态', value: '运行', unit: '' },
            { name: '控制模式', value: '自动', unit: '' },
            { name: '平均温度', value: '24.5', unit: '°C' },
            { name: '最高温度', value: '28.3', unit: '°C' },
            { name: '最低温度', value: '22.8', unit: '°C' },
            { name: '室内湿度', value: '45', unit: '%' },
            { name: '送风温度', value: '18.2', unit: '°C' },
            { name: '冷凝温度', value: '38.6', unit: '°C' }
        ];
    } else if (device === 'fire') {
        return [
            { name: '消防状态', value: '正常', unit: '' },
            { name: '烟感状态', value: '正常', unit: '' },
            { name: '温感状态', value: '正常', unit: '' },
            { name: '气体浓度', value: '0.02', unit: '%' },
            { name: '气瓶压力', value: '5.8', unit: 'MPa' },
            { name: '电源状态', value: '正常', unit: '' },
            { name: '通信状态', value: '正常', unit: '' },
            { name: '警报状态', value: '无告警', unit: '' }
        ];
    } else if (device === 'enviro') {
        return [
            { name: '室内温度', value: '24.5', unit: '°C' },
            { name: '室内湿度', value: '45', unit: '%' },
            { name: '室外温度', value: '18.6', unit: '°C' },
            { name: '室外湿度', value: '65', unit: '%' },
            { name: '柜内温度', value: '32.8', unit: '°C' },
            { name: '柜内湿度', value: '35', unit: '%' },
            { name: '漏水状态', value: '正常', unit: '' },
            { name: '门禁状态', value: '关闭', unit: '' }
        ];
    } else if (device === 'electrical') {
        return [
            { name: '配电状态', value: '正常', unit: '' },
            { name: '主进线电压', value: '380', unit: 'V' },
            { name: '总功率', value: '1.56', unit: 'MW' },
            { name: '总电流', value: '2350', unit: 'A' },
            { name: '功率因数', value: '0.98', unit: '' },
            { name: '变压器温度', value: '58.3', unit: '°C' },
            { name: '母排温度', value: '46.2', unit: '°C' },
            { name: '开关状态', value: '合闸', unit: '' }
        ];
    }

    // 默认返回
    return [
        { name: '系统状态', value: '正常', unit: '' },
        { name: '功率', value: '1.26', unit: 'MW' },
        { name: 'SOC', value: '79.5', unit: '%' },
        { name: '电池健康度', value: '98', unit: '%' }
    ];
}

/**
 * 获取状态点位
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @returns {Array} 状态点位数组
 */
function getStatusPoints(system = 'ems', device = 'local') {
    if (device === 'local') {
        return [
            { name: '读温点检测使能', value: '使能', active: true, valueClass: 'enabled' },
            { name: '读电压频率等模式', value: '默认模式', active: true, valueClass: 'normal' },
            { name: '读并网服务允许', value: '禁用', active: false, valueClass: 'disabled' },
            { name: '读输入干节点定制功能', value: '无效', active: false, valueClass: 'disabled' },
            { name: '读输出干节点C定制功能', value: '无效', active: false, valueClass: 'disabled' },
            { name: '读输出干节点A定制功能', value: '无效', active: false, valueClass: 'disabled' },
            { name: '读功率变化模式', value: '阶跃', active: true, valueClass: 'enabled' },
            { name: '读限制网功能', value: '禁用', active: false, valueClass: 'disabled' },
            { name: '系统启动中状态', value: '无操作', active: false, valueClass: 'default' },
            { name: '读电压频率等动作模式', value: '禁用', active: false, valueClass: 'disabled' },
            { name: '读离网电压启动模式', value: 'Step', active: true, valueClass: 'enabled' },
            { name: '读功率优先级模式', value: 'Q优先默认模式', active: true, valueClass: 'normal' },
            { name: '读网侧供电模式', value: '双侧（并网初始）', active: true, valueClass: 'normal' },
            { name: '读无功控制模式', value: '远程控制', active: true, valueClass: 'enabled' },
            { name: '读Bms协议类型', value: '未定义', active: false, valueClass: 'default' },
            { name: '读有功控制模式', value: '设置有功', active: true, valueClass: 'enabled' },
            { name: '系统充满状态', value: '未充满', active: false, valueClass: 'default' },
            { name: '系统放电状态', value: '未放电', active: false, valueClass: 'default' },
            { name: '系统启停状态', value: '停止', active: false, valueClass: 'stopped' },
            { name: '系统离网状态', value: '未离网', active: false, valueClass: 'default' },
            { name: '系统并网状态', value: '并网', active: true, valueClass: 'enabled' },
            { name: '系统放空状态', value: '未放空', active: false, valueClass: 'default' },
            { name: '读启动方式', value: '手动启动', active: true, valueClass: 'enabled' },
            { name: '读输入干节点B定制功能', value: 'EPO开路故障', active: true, valueClass: 'warning' }
        ];
    } else if (device === 'bms') {
        return [
            { name: 'BMS状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '充电状态', value: '充电中', active: true, valueClass: 'enabled' },
            { name: '放电状态', value: '未放电', active: false, valueClass: 'disabled' },
            { name: '电池簇1状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '电池簇2状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '电池簇3状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '电池簇4状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '温度保护', value: '无', active: false, valueClass: 'normal' },
            { name: '过流保护', value: '无', active: false, valueClass: 'normal' },
            { name: '过压保护', value: '无', active: false, valueClass: 'normal' },
            { name: '欠压保护', value: '无', active: false, valueClass: 'normal' },
            { name: '温度异常', value: '无', active: false, valueClass: 'normal' }
        ];
    } else if (device === 'pcs') {
        return [
            { name: 'PCS状态', value: '运行', active: true, valueClass: 'running' },
            { name: '并网状态', value: '并网', active: true, valueClass: 'enabled' },
            { name: '离网状态', value: '未离网', active: false, valueClass: 'disabled' },
            { name: '直流侧状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '交流侧状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '变流器状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '过温保护', value: '无', active: false, valueClass: 'normal' },
            { name: '过流保护', value: '无', active: false, valueClass: 'normal' },
            { name: '逆变器1状态', value: '运行', active: true, valueClass: 'running' },
            { name: '逆变器2状态', value: '运行', active: true, valueClass: 'running' },
            { name: '逆变器3状态', value: '运行', active: true, valueClass: 'running' },
            { name: '冷却系统状态', value: '正常', active: true, valueClass: 'normal' }
        ];
    } else {
        // 针对其他设备的默认状态点位
        return [
            { name: '设备状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '运行状态', value: '运行中', active: true, valueClass: 'running' },
            { name: '通信状态', value: '正常', active: true, valueClass: 'normal' },
            { name: '故障状态', value: '无故障', active: false, valueClass: 'normal' },
            { name: '告警状态', value: '无告警', active: false, valueClass: 'normal' },
            { name: '维护状态', value: '不需要', active: false, valueClass: 'normal' }
        ];
    }
}

/**
 * 获取遥测数据
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @returns {Array} 遥测数据数组
 */
function getTelemetryData(system = 'ems', device = 'local') {
    const currentTime = new Date().toLocaleTimeString();
    
    if (device === 'local') {
        return [
            { name: '系统有功功率', value: '1.26', unit: 'MW', time: currentTime },
            { name: '系统无功功率', value: '0.12', unit: 'MVar', time: currentTime },
            { name: '电池组SOC', value: '79.5', unit: '%', time: currentTime },
            { name: '电池组SOH', value: '98', unit: '%', time: currentTime },
            { name: '电网频率', value: '50.02', unit: 'Hz', time: currentTime },
            { name: 'A相电压', value: '230.5', unit: 'V', time: currentTime },
            { name: 'B相电压', value: '231.2', unit: 'V', time: currentTime },
            { name: 'C相电压', value: '230.8', unit: 'V', time: currentTime },
            { name: 'A相电流', value: '1825', unit: 'A', time: currentTime },
            { name: 'B相电流', value: '1820', unit: 'A', time: currentTime },
            { name: 'C相电流', value: '1830', unit: 'A', time: currentTime },
            { name: '功率因数', value: '0.98', unit: '', time: currentTime }
        ];
    } else if (device === 'bms') {
        return [
            { name: '电池组电压', value: '750.5', unit: 'V', time: currentTime },
            { name: '电池组电流', value: '1678', unit: 'A', time: currentTime },
            { name: '电池组SOC', value: '79.5', unit: '%', time: currentTime },
            { name: '电池组SOH', value: '98', unit: '%', time: currentTime },
            { name: '最高单体电压', value: '3.75', unit: 'V', time: currentTime },
            { name: '最低单体电压', value: '3.63', unit: 'V', time: currentTime },
            { name: '平均单体电压', value: '3.68', unit: 'V', time: currentTime },
            { name: '单体电压差', value: '0.12', unit: 'V', time: currentTime },
            { name: '最高单体温度', value: '28.3', unit: '°C', time: currentTime },
            { name: '最低单体温度', value: '25.8', unit: '°C', time: currentTime },
            { name: '平均单体温度', value: '27.2', unit: '°C', time: currentTime },
            { name: '单体温度差', value: '2.5', unit: '°C', time: currentTime }
        ];
    } else if (device === 'pcs') {
        return [
            { name: '直流侧电压', value: '750.5', unit: 'V', time: currentTime },
            { name: '直流侧电流', value: '1678', unit: 'A', time: currentTime },
            { name: '有功功率', value: '1.26', unit: 'MW', time: currentTime },
            { name: '无功功率', value: '0.12', unit: 'MVar', time: currentTime },
            { name: '电网频率', value: '50.02', unit: 'Hz', time: currentTime },
            { name: 'A相电压', value: '230.5', unit: 'V', time: currentTime },
            { name: 'B相电压', value: '231.2', unit: 'V', time: currentTime },
            { name: 'C相电压', value: '230.8', unit: 'V', time: currentTime },
            { name: 'A相电流', value: '1825', unit: 'A', time: currentTime },
            { name: 'B相电流', value: '1820', unit: 'A', time: currentTime },
            { name: 'C相电流', value: '1830', unit: 'A', time: currentTime },
            { name: '变流器温度', value: '42.6', unit: '°C', time: currentTime }
        ];
    } else {
        // 针对其他设备的默认遥测数据
        return [
            { name: '设备温度', value: '35.6', unit: '°C', time: currentTime },
            { name: '设备湿度', value: '45', unit: '%', time: currentTime },
            { name: '设备电压', value: '220', unit: 'V', time: currentTime },
            { name: '设备电流', value: '10.5', unit: 'A', time: currentTime },
            { name: '运行时间', value: '342', unit: 'h', time: currentTime },
            { name: '通信延迟', value: '25', unit: 'ms', time: currentTime }
        ];
    }
}

/**
 * 获取告警点位
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @returns {Array} 告警点位数组
 */
function getAlarmPoints(system = 'ems', device = 'local') {
    // 随机决定是否有告警
    const hasAlarms = Math.random() > 0.3;
    
    if (!hasAlarms) {
        return [];
    }
    
    // 根据设备类型返回不同的告警
    let possibleAlarms = [];
    
    if (device === 'local') {
        possibleAlarms = [
            { name: '系统通信中断', value: '告警', level: 2 },
            { name: '系统过温预警', value: '告警', level: 2 },
            { name: '控制器重启', value: '信息', level: 1 },
            { name: 'PLC通信异常', value: '告警', level: 2 },
            { name: '系统SOC过低', value: '告警', level: 2 },
            { name: '功率限制', value: '信息', level: 1 },
            { name: '通信服务异常', value: '告警', level: 2 },
            { name: '数据库异常', value: '信息', level: 1 }
        ];
    } else if (device === 'bms') {
        possibleAlarms = [
            { name: '电池簇2温度偏高', value: '告警', level: 2 },
            { name: '单体电压不均衡', value: '告警', level: 2 },
            { name: '绝缘电阻过低', value: '故障', level: 3 },
            { name: 'SOC过低', value: '告警', level: 2 },
            { name: '电池堆1温度不均匀性超出阈值', value: '告警', level: 2 },
            { name: 'BMU通信中断', value: '告警', level: 2 },
            { name: '电池簇3通信中断', value: '信息', level: 1 },
            { name: '电池温度传感器异常', value: '信息', level: 1 }
        ];
    } else if (device === 'pcs') {
        possibleAlarms = [
            { name: 'PCS-1通信中断', value: '信息', level: 1 },
            { name: '逆变器过温', value: '告警', level: 2 },
            { name: 'IGBT故障', value: '故障', level: 3 },
            { name: 'AC侧过流', value: '告警', level: 2 },
            { name: 'DC侧过压', value: '告警', level: 2 },
            { name: '风扇异常', value: '信息', level: 1 },
            { name: '网侧电压异常', value: '告警', level: 2 },
            { name: '功率因数过低', value: '信息', level: 1 }
        ];
    } else if (device === 'thermal') {
        possibleAlarms = [
            { name: '空调过滤器需要清洗', value: '信息', level: 1 },
            { name: '室内温度过高', value: '告警', level: 2 },
            { name: '冷却液位低', value: '告警', level: 2 },
            { name: '冷却泵异常', value: '故障', level: 3 },
            { name: '温度传感器故障', value: '告警', level: 2 },
            { name: '空调压缩机过载', value: '告警', level: 2 },
            { name: '空调制冷效率低', value: '信息', level: 1 },
            { name: '风阀控制异常', value: '信息', level: 1 }
        ];
    } else if (device === 'fire') {
        possibleAlarms = [
            { name: '烟感器激活', value: '告警', level: 2 },
            { name: '消防系统自检', value: '信息', level: 1 },
            { name: '气体浓度异常', value: '告警', level: 2 },
            { name: '消防电源异常', value: '告警', level: 2 },
            { name: '气瓶压力低', value: '告警', level: 2 },
            { name: '消防阀门异常', value: '信息', level: 1 },
            { name: '温感器故障', value: '信息', level: 1 },
            { name: '消防控制器通信故障', value: '告警', level: 2 }
        ];
    } else {
        possibleAlarms = [
            { name: '设备通信中断', value: '告警', level: 2 },
            { name: '设备温度过高', value: '告警', level: 2 },
            { name: '设备需要维护', value: '信息', level: 1 },
            { name: '设备运行异常', value: '告警', level: 2 }
        ];
    }
    
    // 随机选择1-3个告警
    const alarmCount = Math.floor(Math.random() * 3) + 1;
    const alarms = [];
    
    for (let i = 0; i < alarmCount; i++) {
        if (possibleAlarms.length > 0) {
            const randomIndex = Math.floor(Math.random() * possibleAlarms.length);
            alarms.push(possibleAlarms[randomIndex]);
            possibleAlarms.splice(randomIndex, 1);
        }
    }
    
    return alarms;
}

/**
 * 获取控制点位
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @returns {Array} 控制点位数组
 */
function getControlPoints(system = 'ems', device = 'local') {
    if (device === 'local') {
        return [
            {
                name: '系统控制',
                type: 'button',
                options: [
                    { label: '启动系统', value: 'start' },
                    { label: '停止系统', value: 'stop' },
                    { label: '紧急停机', value: 'emergency' }
                ]
            },
            {
                name: '运行模式',
                type: 'radio',
                options: [
                    { label: '自动模式', value: 'auto', checked: true },
                    { label: '手动模式', value: 'manual', checked: false },
                    { label: '待机模式', value: 'standby', checked: false }
                ]
            },
            {
                name: '并网状态',
                type: 'button',
                options: [
                    { label: '并网', value: 'on-grid' },
                    { label: '离网', value: 'off-grid' }
                ]
            },
            {
                name: '有功功率设定',
                type: 'input',
                value: '1.0',
                min: '-2.5',
                max: '2.5',
                unit: 'MW'
            },
            {
                name: '无功功率设定',
                type: 'input',
                value: '0.0',
                min: '-0.5',
                max: '0.5',
                unit: 'MVar'
            }
        ];
    } else if (device === 'bms') {
        return [
            {
                name: 'BMS控制',
                type: 'button',
                options: [
                    { label: '充电使能', value: 'charge-enable' },
                    { label: '放电使能', value: 'discharge-enable' },
                    { label: '强制离线', value: 'force-offline' }
                ]
            },
            {
                name: '充电电流限制',
                type: 'input',
                value: '1800',
                min: '0',
                max: '2000',
                unit: 'A'
            },
            {
                name: '放电电流限制',
                type: 'input',
                value: '1800',
                min: '0',
                max: '2000',
                unit: 'A'
            },
            {
                name: '电池均衡模式',
                type: 'radio',
                options: [
                    { label: '自动均衡', value: 'auto', checked: true },
                    { label: '手动均衡', value: 'manual', checked: false },
                    { label: '关闭均衡', value: 'off', checked: false }
                ]
            }
        ];
    } else if (device === 'pcs') {
        return [
            {
                name: 'PCS控制',
                type: 'button',
                options: [
                    { label: '启动', value: 'start' },
                    { label: '停止', value: 'stop' },
                    { label: '复位', value: 'reset' }
                ]
            },
            {
                name: '功率限制',
                type: 'input',
                value: '2.5',
                min: '0',
                max: '3.0',
                unit: 'MW'
            },
            {
                name: '运行模式',
                type: 'radio',
                options: [
                    { label: '有功控制', value: 'p-control', checked: true },
                    { label: '无功控制', value: 'q-control', checked: false },
                    { label: 'PQ控制', value: 'pq-control', checked: false }
                ]
            },
            {
                name: '并网/离网',
                type: 'radio',
                options: [
                    { label: '并网模式', value: 'grid-tied', checked: true },
                    { label: '离网模式', value: 'off-grid', checked: false }
                ]
            }
        ];
    } else {
        // 针对其他设备的默认控制点位
        return [
            {
                name: '设备控制',
                type: 'button',
                options: [
                    { label: '启动', value: 'start' },
                    { label: '停止', value: 'stop' },
                    { label: '复位', value: 'reset' }
                ]
            },
            {
                name: '运行模式',
                type: 'radio',
                options: [
                    { label: '自动模式', value: 'auto', checked: true },
                    { label: '手动模式', value: 'manual', checked: false }
                ]
            }
        ];
    }
}

/**
 * 获取配置参数
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} group - 参数组 (operation或protection)
 * @returns {Array} 配置参数数组
 */
function getConfigParams(system = 'ems', device = 'local', group = 'operation') {
    if (device === 'local') {
        if (group === 'operation') {
            return [
                { name: '有功功率上限', value: '2.5', unit: 'MW', range: '0~3.0', status: '正常' },
                { name: '无功功率上限', value: '0.5', unit: 'MVar', range: '0~1.0', status: '正常' },
                { name: 'SOC上限', value: '90', unit: '%', range: '50~100', status: '正常' },
                { name: 'SOC下限', value: '10', unit: '%', range: '0~50', status: '正常' },
                { name: '功率变化斜率', value: '10', unit: '%/min', range: '1~100', status: '正常' },
                { name: '功率因数设定', value: '0.98', unit: '', range: '0.8~1.0', status: '正常' },
                { name: '自动启停使能', value: '1', unit: '', range: '0~1', status: '正常' },
                { name: '自动均衡使能', value: '1', unit: '', range: '0~1', status: '正常' }
            ];
        } else {
            return [
                { name: '过压保护点', value: '800', unit: 'V', range: '750~850', status: '正常' },
                { name: '欠压保护点', value: '650', unit: 'V', range: '600~700', status: '正常' },
                { name: '过流保护点', value: '2000', unit: 'A', range: '1800~2200', status: '正常' },
                { name: '过温保护点', value: '60', unit: '°C', range: '55~65', status: '正常' },
                { name: '温差保护点', value: '15', unit: '°C', range: '10~20', status: '正常' },
                { name: '电压差保护点', value: '0.5', unit: 'V', range: '0.3~0.8', status: '正常' },
                { name: '过频保护点', value: '51.5', unit: 'Hz', range: '50.5~52.0', status: '正常' },
                { name: '欠频保护点', value: '48.5', unit: 'Hz', range: '48.0~49.5', status: '正常' }
            ];
        }
    } else if (device === 'bms') {
        if (group === 'operation') {
            return [
                { name: '充电电流限制', value: '1800', unit: 'A', range: '0~2000', status: '正常' },
                { name: '放电电流限制', value: '1800', unit: 'A', range: '0~2000', status: '正常' },
                { name: '充电截止SOC', value: '90', unit: '%', range: '80~100', status: '正常' },
                { name: '放电截止SOC', value: '10', unit: '%', range: '0~20', status: '正常' },
                { name: '均衡开启电压差', value: '0.03', unit: 'V', range: '0.01~0.1', status: '正常' },
                { name: '均衡模式', value: '1', unit: '', range: '0~2', status: '正常' },
                { name: '预充电时间', value: '30', unit: 's', range: '10~60', status: '正常' },
                { name: '预充电电流', value: '100', unit: 'A', range: '50~200', status: '正常' }
            ];
        } else {
            return [
                { name: '单体过压保护', value: '3.8', unit: 'V', range: '3.6~4.0', status: '正常' },
                { name: '单体欠压保护', value: '3.0', unit: 'V', range: '2.8~3.2', status: '正常' },
                { name: '组端过压保护', value: '800', unit: 'V', range: '750~850', status: '正常' },
                { name: '组端欠压保护', value: '650', unit: 'V', range: '600~700', status: '正常' },
                { name: '充电过流保护', value: '2000', unit: 'A', range: '1800~2200', status: '正常' },
                { name: '放电过流保护', value: '2000', unit: 'A', range: '1800~2200', status: '正常' },
                { name: '高温保护点', value: '55', unit: '°C', range: '50~60', status: '正常' },
                { name: '低温保护点', value: '0', unit: '°C', range: '-10~5', status: '正常' }
            ];
        }
    } else {
        // 针对其他设备的默认配置参数
        if (group === 'operation') {
            return [
                { name: '运行参数1', value: '50', unit: '', range: '0~100', status: '正常' },
                { name: '运行参数2', value: '75', unit: '', range: '0~100', status: '正常' },
                { name: '运行参数3', value: '25', unit: '', range: '0~100', status: '正常' },
                { name: '运行参数4', value: '10', unit: '', range: '0~100', status: '正常' }
            ];
        } else {
            return [
                { name: '保护参数1', value: '90', unit: '', range: '0~100', status: '正常' },
                { name: '保护参数2', value: '80', unit: '', range: '0~100', status: '正常' },
                { name: '保护参数3', value: '70', unit: '', range: '0~100', status: '正常' },
                { name: '保护参数4', value: '60', unit: '', range: '0~100', status: '正常' }
            ];
        }
    }
} 