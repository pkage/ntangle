const ntangle	= require('.')

const async	= new ntangle.AsyncClient('tcp://127.0.0.1:25570')
const sync	= new ntangle.Client('tcp://127.0.0.1:25570')



async.get_entities('foo')
	.then(r => {
		console.log('async response: ', r)
	})
	.catch(e => {
		console.log('async error: ', e)
	})


console.log('sync: ', sync.get_entities('foo'))
