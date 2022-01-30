module.exports = {
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['./src/**'],
    coverageThreshold: {
        global: {
            lines: 70
        }
    }
}