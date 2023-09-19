export default function sum(...arg) {
    return arg.reduce((p, c) => p+c, 0)
}