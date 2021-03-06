const _ = require('lodash');
const fs = require('fs'); 
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');
let writer = csvWriter();
let program = require('commander');

program
  .version('0.0.1', '-v, --version')
  .option('-str, --switchonstartfunctionality', 'enable start functionality for each format')
  .option('-end, --switchonendfunctionality', 'enable end functionality for each format');

program.on('--help', function(){
  console.log('')
  console.log('About the programm:');
  console.log('This app will allow you to read from csv file and put this info into three different formats.');
});
  
  
program.parse(process.argv);

function getConfigData() {
    console.log("using node conf");
    const config_data = require('../config.json');

    return config_data;
}

main(getConfigData());

function main(config_data) {
    const inputFilePath = config_data.input_file;
    const outputFilePath = config_data.output_csv_file;
    const outputFormats = config_data.output_format;
    const outputFileJsonPath = config_data.output_json_file;

    const consoleOutputProvider = {
        onStart() {
            console.log("Start console output provider");
        },
        onData(data) {
            console.log("Console data output: ");
            console.log(JSON.stringify(data, null, 4));
        },
        onEnd() {
            console.log("Finish console output provider");
        }
    }

    const jsonOutputProvider = {
        onStart(){
            console.log("Start json output provider");
        },
        onData(data){
            var jsonFormatedData = JSON.stringify(data);
            fs.writeFile(outputFileJsonPath, jsonFormatedData, 'utf8', function(err) {
                if (err){
                    throw err;
                }
            });
        },
        onEnd(){
            console.log("Finish json output provider");
        }
    }

    const csvOutputProvider = {
        onStart(){
            console.log("Start csv output provider");
        },
        onData(data){
            writer.pipe(fs.createWriteStream(outputFilePath, {flags: 'a'}))
            writer.write(data);
        },
        onEnd(){
            //writer.end
            console.log("Finish csv output provider");
        }
    }
    
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
    .on('start', function(){
        if (program.switchonstartfunctionality){
            onStartFunctionality();
        }
    })
    .pipe(csv())
    .on('data', function(data){
        try {
            outputData(data);              
        }
        catch(err) {
            console.log(err);
        }
    })
    .on('end',function(){
        if (program.switchonendfunctionality){
            endFunctionality();
        }
    });  

    function endFunctionality(){
        _.forEach(outputFormats, function (format) {
                knownFormatProviders[format].onEnd();
        });
    }

    function outputData(data){
        _.forEach(outputFormats, format => knownFormatProviders[format].onData(data));
    }    

    function onStartFunctionality(){
        _.forEach(formats, format => knownFormatProviders[format].onStart());
    }
}

//TODO: CLI
//---DONE: 0. Обработка аргументов средами ноды просто руками (read with Node only) - операционка стартует процесс и подает ей параметры
//---DONE:1. Сделать параметры для названий файлов, которые конфигурировались бы при старте 
// приложения - how to read using external libraries, compare them. Параметры: флаги (например, verbose)
// , единичные значения - конкретно, что будет использоваться; списки - например, в каком формате выдаем файлы
//---DONE: 2. Сделать тип выхода \ печати данных (консоль, csv, json)
//3. Создать специфичные команды со специфичными флажками, которые
// мы могли бы вызывать через терминал - мб с помощью какой-то библиотечки, commandsName,Age

//pipe, on(End/data/...) - Stream concept in nodeJS. Why? (what problem solved). How to use? How it works?

// Micro task vs Macro task (vs Event task)
