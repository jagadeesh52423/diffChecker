class LCSAlgorithm {
    constructor() {
        this.memo = new Map();
    }

    createKey(str1, str2) {
        return JSON.stringify([str1, str2]);
    }

    findLCS(text1, text2) {
        const m = text1.length;
        const n = text2.length;
        const key = this.createKey(text1, text2);

        if (this.memo.has(key)) {
            return this.memo.get(key);
        }

        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (text1[i - 1] === text2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        this.memo.set(key, dp);
        return dp;
    }

    findLCSLines(data1, data2) {
        const m = data1.length;
        const n = data2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const innerDp = this.findLCS(data1[i - 1], data2[j - 1]);
                const comparisonValue = innerDp[data1[i - 1].length][data2[j - 1].length];
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1] + comparisonValue);
            }
        }

        return dp;
    }

    traceBackLCS(data1, data2, dp) {
        let i = data1.length;
        let j = data2.length;
        const matchingLines1 = Array(data1.length).fill(-1);
        const matchingLines2 = Array(data2.length).fill(-1);

        while (i > 0 && j > 0) {
            if (dp[i][j] === dp[i - 1][j]) {
                i--;
            } else if (dp[i][j] === dp[i][j - 1]) {
                j--;
            } else {
                matchingLines1[i - 1] = j - 1;
                matchingLines2[j - 1] = i - 1;
                i--;
                j--;
            }
        }

        return { matchingLines1, matchingLines2 };
    }
}

export default LCSAlgorithm;