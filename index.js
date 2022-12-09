console.log("Consumer")
const Kafka = require('node-rdkafka')
const { Client } = require('@elastic/elasticsearch')
const logger =require('./logger')

const client = new Client({
    node: `${process.env.ELASTIC_URL}`,
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'infra-chart',
    'metadata.broker.list': `${process.env.KAFKA_BROKER}`
}, {})

consumer.connect();

consumer.on('ready', () => {
    consumer.subscribe([`${process.env.TOPIC_NAME}`])
    consumer.consume();
    logger.info("Consumer ready")
}).on('data', async (data) => {
    logger.info(`The message is received by the consumer`)
    let parsedData = JSON.parse(data.value);
    let {index, id, ...indexData} = {...parsedData}
    logger.info(`ID: ${parsedData.id}, Topic Name: ${data.topic}`)
    await client.update({
        index: parsedData.index,
        id: parsedData.id,
        doc: {
            summary: indexData.summary,
            task: indexData.task,
            dueDate: indexData.dueDate,
            priority: indexData.priority,
            state: indexData.state
        }
    })
})

consumer.on('error', function (err) {
    logger.error('Error in Kafka consumer');
})