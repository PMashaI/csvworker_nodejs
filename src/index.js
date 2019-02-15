const _ = require('lodash');
const fs = require('fs'); 
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');

function getConfigData() {
    const config_data = require('../config.json');

    return config_data;
}

function getConfigDataFromArgs() {
    return { ... };
}

function getConfigDataFromArgsUsingCommandLineParser() {
    return { ... };
}

main(getConfigData());

function main(config_data) {
    const inputFilePath = config_data.input_file;
    const outputFilePath = config_data.output_csv_file;
    const outputFormats = config_data.output_format;
    const outputFileJsonPath = config_data.output_json_file;

    const knownFormatProviders = {
        console: consoleOutputProvider,
        json: jsonOutputProvider,
        csv: csvOutputProvider
    };

    console.log("inputFile " + inputFilePath);
    console.log("outputFile " + outputFilePath);
    console.log("formats " + outputFormats);
    console.log("outputFileJson " + outputFileJsonPath);

    fs.createReadStream(inputFilePath)
    .pipe(csv()) //TODO: call forEach для onStart для каждого провайдера
    .on('data', function(data){
        try {
            outputData(data, outputFormats);
        }
        catch(err) {
            console.log(err);
        }
    })
    .on('end',function(){
        //TODO: call forEach для onEnd для каждого провайдера
        writer.end();
        console.log("finish");
    });  

    function outputData(data, formats){
        _.forEach(formats, format => knownFormatProviders[format](data));
    }

    const consoleOutputProvider = {
        onStart() {
        },
        onData(data) {
            console.log("Console data output: ");
            console.log(JSON.stringify(data, null, 4));
        },
        onEnd() {
        }
    }

    function jsonOutputProvider(data){
        //TODO: write all data in the file, not separate 
        var jsonFormatedData = JSON.stringify(data);
        fs.writeFile(outputFileJsonPath, jsonFormatedData, 'utf8', function(err) {
            if (err){
                throw err;
            }
        });
    }

    function csvOutputProvider(data){
    let writer = csvWriter();
        writer.pipe(fs.createWriteStream(outputFilePath, {flags: 'a'}))
        writer.write(data);
    }
}
//TODO: CLI
//---DONE: 0. Обработка аргументов средами ноды просто руками (read with Node only) - операционка стартует процесс и подает ей параметры
//1. Сделать параметры для названий файлов, которые конфигурировались бы при старте 
// приложения - how to read using external libraries, compare them. Параметры: флаги (например, verbose)
// , единичные значения - конкретно, что будет использоваться; списки - например, в каком формате выдаем файлы
//---DONE: 2. Сделать тип выхода \ печати данных (консоль, csv, json)
//3. Создать специфичные команды со специфичными флажками, которые
// мы могли бы вызывать через терминал - мб с помощью какой-то библиотечки, commandsName,Age

//pipe, on(End/data/...) - Stream concept in nodeJS. Why? (what problem solved). How to use? How it works?

// Micro task vs Macro task (vs Event task)