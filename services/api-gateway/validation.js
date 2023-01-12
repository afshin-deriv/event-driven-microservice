const {v4: uuidv4} = require('uuid');

const USER_ID = uuidv4();
function validateAndParse (data) {
    if (! data.type) {
        throw 'Invalid Request format';
    }

    switch(data.type) {
        case "ADD_USER": {
            const jsonData = JSON.stringify({
                "user_id": USER_ID,
                "type": data.type,
            });
            return jsonData;
        }
        case "REMOVE_USER":{
            if (!data.user_id) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "type": data.type,
            });
            return jsonData;
        }
        case "USER_INFO":{
            if (!data.user_id) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "type": data.type,
            });
            return jsonData;
        }
        case "DEPOSIT":{
            if (!data.user_id && !data.amount) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        case "WITHDRAW":{
            if (!data.user_id && !data.amount) throw 'Invalid Request format';
            const jsonData = JSON.stringify({
                "user_id": data.user_id,
                "amount": data.amount,
                "type": data.type,
            });
            return jsonData;
        }
        case "BUY":{
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
        case "SELL":{
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