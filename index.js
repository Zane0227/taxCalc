const inquirer = require("inquirer");
const chalk = require("chalk");

const askQuestions = () => {
    const questions = [{
            name: "toltalMonth",
            type: "input",
            message: "请输入你的全部月收入"
        },
        {
            name: "yearSummary",
            type: "input",
            message: "请输入你的预期年终"
        },
        {
            name: "fundBase",
            type: "input",
            message: "请输入你公积金基数"
        },
        {
            name: "fundCoefficient",
            type: "input",
            message: "请输入你公积金系数(小数)"
        }
    ];
    return inquirer.prompt(questions);
};

const calc = (answers) => {
    const numAns = {}
    for (let key in answers) {
        numAns[key] = Number(answers[key])
    }
    const {
        toltalMonth,
        yearSummary,
        fundBase,
        fundCoefficient
    } = numAns
    const realMonth = (toltalMonth * 12 + yearSummary) / 12 // 合并计税总月薪
    const fund = fundBase * fundCoefficient // 公积金
    const socialSecurity = fundBase * 0.105 // 社保
    const taxiBase = (realMonth - fund - socialSecurity) * 12 // 缴税基数
    const taxi = taxiCalc(taxiBase) // 年缴税
    const monthTaxiBase = toltalMonth - fund - socialSecurity; // 实际计税月薪
    const realHandMonth = monthTaxiBase - taxiCalc(monthTaxiBase * 12) / 12 // 实际月到手
    const realYearSummary = taxiBase - taxi - realHandMonth * 12;
    return {
        taxiBase,
        taxi,
        fund,
        realHandMonth,
        realYearSummary
    }
}

const taxiCalc = (taxiBase) => {
    taxiBase = taxiBase
    let taxiSecurity;
    let quickReduce;
    if (taxiBase <= 36000) {
        taxiSecurity = 0
        quickReduce = 0
    } else if (taxiBase > 36000 && taxiBase <= 144000) {
        taxiSecurity = 0.1
        quickReduce = 2520
    } else if (taxiBase > 144000 && taxiBase <= 300000) {
        taxiSecurity = 0.2
        quickReduce = 16920
    } else if (taxiBase > 300000 && taxiBase <= 420000) {
        taxiSecurity = 0.25
        quickReduce = 31920
    } else if (taxiBase > 420000 && taxiBase <= 660000) {
        taxiSecurity = 0.3
        quickReduce = 52920
    }
    const res = taxiBase * taxiSecurity - quickReduce
    return res
}

const success = res => {
    console.log(
        chalk.white(`你的年纳税额为: ${res.taxi}`)
    );
    console.log(
        chalk.white(`你的月到手为: ${res.realHandMonth}`)
    );
    console.log(
        chalk.white(`你的年终到手为: ${res.realYearSummary}`)
    );
    console.log(
        chalk.white(`你的实际年收入为: ${res.taxiBase - res.taxi}`)
    );
    console.log(
        chalk.white(`你的年公积金额度为: ${res.fund * 2 * 12}`)
    );
};

const run = async () => {
    const answers = await askQuestions();
    const res = calc(answers)
    success(res);
};

run();