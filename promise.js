// 代码来自 稀土掘金 作者：齐小神  链接：https://juejin.cn/post/6850037281206566919

// promise基本特征
//   promise 有三个状态：pending，fulfilled，or rejected；「规范 Promise/A+ 2.1」
//   new promise时， 需要传递一个executor()执行器，执行器立即执行；
//   executor接受两个参数，分别是resolve和reject；
//   promise  的默认状态是 pending；
//   promise 有一个value保存成功状态的值，可以是undefined/thenable/promise；「规范 Promise/A+ 1.3」
//   promise 有一个reason保存失败状态的值；「规范 Promise/A+ 1.5」
//   promise 只能从pending到rejected, 或者从pending到fulfilled，状态一旦确认，就不会再改变；
//   promise 必须有一个then方法，then 接收两个参数，分别是 promise 成功的回调 onFulfilled, 和 promise 失败的回调 onRejected；「规范 Promise/A+ 2.2」
//   如果调用 then 时，promise 已经成功，则执行onFulfilled，参数是promise的value；
//   如果调用 then 时，promise 已经失败，那么执行onRejected, 参数是promise的reason；
//   如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 then 的失败的回调onRejected；

const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class Promise {
    constructor(executor) {
        // 默认状态pending
        this.status = PENDING;
        // 存放成功状态的值,初始化为undefined
        this.value = undefined;
        // 存放失败理由的值，初始化为undefined
        this.reason = undefined;

        /**
         * 解决异步
         */
        // 收集成功的回调
        this.onResolvedCallback = [];
        // 收集失败的回调
        this.onRejectedCallback = [];

        // 成功时调用的方法
        let resolve = value => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;

                /**
                 * 解决异步
                 * 取出依赖执行依赖
                 */
                this.onResolvedCallback.forEach(fn => fn());
            }
        }

        // 失败时调用的方法
        let reject = reason => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;

                /**
                 * 解决异步
                 * 取出依赖执行依赖
                 */
                this.onRejectedCallback.forEach(fn => fn());
            }
        }

        // 立即执行executor函数
        try {
            executor(resolve, reject);
        } catch (error) {
            // 发生异常时的失败处理逻辑
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : data => { resolve(data); };
        onRejected = typeof onRejected === "function" ? onRejected : err => { throw err; };
        if (this.status === FULFILLED) {
            return new Promise((resolve, reject) => {
                try {
                    let x = onFulfilled(this.value);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                } catch (e) {
                    reject(e);
                }
            })
        }

        if (this.status === REJECTED) {
            return new Promise((resolve, reject) => {
                try {
                    let x = onRejected(this.reason);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                } catch (e) {
                    reject(e);
                }
            })
        }

        /**
         * 解决异步
         * 收集依赖
         */
        if (this.status === PENDING) {
            return new Promise((resolve, reject) => {
                this.onResolvedCallback.push(() => {
                    let x = onFulfilled(this.value);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                });

                this.onRejectedCallback.push(() => {
                    let x = onRejected(this.reason);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                });
            })
        }
    }
}

// 测试
// const promise = new Promise((resolve, reject) => {
//     reject("简历被筛");
// }).then(
//     data => {
//         console.log("success", data);
//     },
//     reason => {
//         console.log("fail", reason);
//     }
// )

// const promise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve("二面通知");
//     }, 1000);
// }).then(
//     data => {
//         console.log("success", data);
//     },
//     reason => {
//         console.log("failed", reason);
//     }
// )

// const promise = new Promise((resolve, reject) => {
//     reject("一个也没AC");
// }).then().then().then(
//     data => {
//         console.log("success", data);
//     },
//     reason => {
//         console.log("failed", reason);
//         return "lll";
//     }
// ).then(
//     data => {
//         console.log("成功", data);
//     },
//     reason => {
//         console.log("失败");
//     }
// )


// Promise.defer = Promise.deferred = function() {
//     let dfd = {};
//     dfd.promise = new Promise((resolve, reject) => {
//         dfd.resolve = resolve;
//         dfd.reject = reject;
//     })
//     return dfd;
// }

// module.exports = Promise;