#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const chalkLog = (desc, amount) => {
    console.log(chalk.black.bold(desc) + chalk.cyan(amount))
}

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
            message: "请输入你公积金缴纳基数"
        },
        {
            name: "fundCoefficient",
            type: "input",
            message: "请输入你公积金系数(小数)"
        },
        {
            name: "taxFreeAmount",
            type: "input",
            message: "请输入个税专项附加扣除金额"
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
        fundCoefficient,
        taxFreeAmount
    } = numAns
    const realMonth = (toltalMonth * 12 + yearSummary) / 12 // 合并计税总月薪
    const fund = fundBase * fundCoefficient // 公积金
    const socialSecurity = fundBase * 0.105 // 社保
    const taxBase = (realMonth - fund - socialSecurity) * 12 // 缴税基数
    const tax = taxCalc(taxBase - taxFreeAmount * 12) // 年缴税
    const monthtaxBase = toltalMonth - fund - socialSecurity; // 实际计税月薪
    const realHandMonth = monthtaxBase - taxCalc((monthtaxBase - taxFreeAmount) * 12) / 12 // 实际月到手
    const realYearSummary = taxBase - tax - realHandMonth * 12;
    return {
        taxBase,
        tax,
        fund,
        realHandMonth,
        realYearSummary
    }
}

const taxCalc = (taxBase) => {
    taxBase = taxBase
    let taxSecurity;
    let quickReduce;
    if (taxBase <= 36000) {
        taxSecurity = 0
        quickReduce = 0
    } else if (taxBase > 36000 && taxBase <= 144000) {
        taxSecurity = 0.1
        quickReduce = 2520
    } else if (taxBase > 144000 && taxBase <= 300000) {
        taxSecurity = 0.2
        quickReduce = 16920
    } else if (taxBase > 300000 && taxBase <= 420000) {
        taxSecurity = 0.25
        quickReduce = 31920
    } else if (taxBase > 420000 && taxBase <= 660000) {
        taxSecurity = 0.3
        quickReduce = 52920
    }
    const res = taxBase * taxSecurity - quickReduce
    return res
}

const success = res => {
    const totalYearAmount = res.taxBase - res.tax
    const totalFund = res.fund * 2 * 12
    chalkLog(`💰 你的年纳税额为: `, res.tax)
    chalkLog(`💰 你的月到手为: `, res.realHandMonth)
    chalkLog(`💰 你的年终到手为: `, res.realYearSummary)
    chalkLog(`💰 你的实际年到手收入为: `, totalYearAmount)
    chalkLog(`💰 你的年公积金额度为: `, totalFund)
    chalkLog(`💰 你的年总收入为: `, totalYearAmount + totalFund)
};

const run = async () => {
    const answers = await askQuestions();
    const res = calc(answers)
    success(res);
};

run();