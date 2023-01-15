const {v4: uuidv4} = require('uuid');

function validateAndParse (data) {
    if (!data.type) {
        throw 'Invalid Request format';
    }

    switch(data.type.toLowerCase()) {
        case "add_user": {
            const jsonData = JSON.stringify({
                "type": data.type,
            });
            return jsonData;
        }
        case "remove_user":{
            if (!data.user_id) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "type": data.type,
            });
            return jsonData;
        }
        case "user_info":{
            if (!data.user_id) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "type": data.type,
            });
            return jsonData;
        }
        case "deposit":{
            if (!data.user_id && !data.amount) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        case "withdraw":{
            if (!data.user_id && !data.amount) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        case "buy":{
            if (!data.user_id && !data.amount && !data.symbol && !data.price) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "symbol": data.symbol,
                "price": data.price,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        case "sell":{
            if (!data.user_id && !data.amount && !data.symbol && !data.price) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "symbol": data.symbol,
                "price": data.price,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        default:{
            throw 'Invalid Request format';
        }
    }
}

module.exports = {
    validateAndParse
}