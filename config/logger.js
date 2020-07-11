const {createLogger, format, transports} = require('winston')

const util = require('util')

const transform = (info, opts) => {
    const args = info[Symbol.for('splat')]
    if (args) { info.message = util.format(info.message, ...args) }
    return info
}

const utilFormatter = () => { return {transform}}

const logger = createLogger({
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({
            filename: 'debug.log',
            format : format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
                format.printf(msg => 
                    `${msg.timestamp} - ${msg.message}`
                )
            ),
            level : 'debug'
        }),
        new transports.File({
            filename: 'error.log',
            format : format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
                format.printf(msg => 
                    `${msg.timestamp} -${msg.message}`
                )
            ),
            level : 'error'
        }),
        new transports.Stream({
            stream: process.stderr,
            level: 'debug',
            format: format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
                utilFormatter(),    
                format.colorize({all : true}),
                format.printf(msg => 
                    `${msg.timestamp} - ${msg.level}: ${msg.message}`
                )
            )
        }),
    ],
    rejectionHandlers : [
        new transports.File({ filename: 'rejections.log' })
    ]
})

global.logger = logger