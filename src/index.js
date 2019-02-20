const _ = require('lodash');
const fs = require('fs'); 
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');
let writer = csvWriter();

const commandLineUsage = require('command-line-usage');
const usage = [
    {
      header: 'parsers_app',
      content: 'This app will allow you to read from csv file and put this info into three different formats.'
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'help',
          description: 'Display this usage guide.',
          alias: 'h',
          type: Boolean
        },
        {
          name: 'src',
          description: 'The input files to process. This is some additional text existing solely to demonstrate word-wrapping, nothing more, nothing less. And nothing in between.',
          type: String,
          multiple: true,
          defaultOption: true,
          typeLabel: '{underline file} ...'
        },
        {
          name: 'timeout',
          description: 'Timeout value in ms.',
          alias: 't',
          type: Number,
          typeLabel: '{underline ms}'
        }
      ]
    },
    {
      content: 'Project home: {underline https://github.com/PMashaI/csvworker_nodejs}'
    }
  ];

 const conf =  commandLineUsage(usage);
console.log(conf);

const flipit = require('flipit');

flipit.enable('testFeature')
//here the promise comes
flipit.load('flipitConfigurationFile.json');

const flagger = require('flagger');

const fflip = require('fflip');
const fflipEntities = getFeaturesAndCriterias(); 

fflip.config({
  criteria: fflipEntities.criterias,
  features: fflipEntities.features
});

function getConfigData() {
    console.log("using node conf");
    const config_data = require('../config.json');

    return config_data;
}

function getConfigDataFromArgs() {
    
}

main(getConfigData());

function getFeaturesAndCriterias() { 
    return { 
        features: [
            {
            id: 'consoleOutputProviderOnEnd',
            name: 'consoleOutputProvider call onEnd functionality', 
            description: 'should use onEnd functionality for consoleOutputProvider',
            enabled: false,
            criteria: {consoleFormat: 'console'}
            },
            {
            id: 'jsonOutputProviderOnEnd',
            name: 'jsonOutputProvider call onEnd functionality', 
            description: 'should use onEnd functionality for jsonOutputProvider',
            enabled: false,
            criteria: {jsonFormat: 'json'}
            },
            {
            id: 'csvOutputProviderOnEnd',
            name: 'csvOutputProvider call onEnd functionality', 
            description: 'should use onEnd functionality for csvOutputProvider',
            enabled: true,
            criteria: {csvFormat: 'csv'}
            }
        ],
    criterias: [
        {
          id: 'jsonFormat',
          check: function(format) {
            return format == 'json';
          }
        },
        {
          id: 'consoleFormat',
          check: function(format) {
            return format == 'console';
          }
        },
        {
          id: 'csvFormat',
          check: function(format) {
            return format == 'csv';
          }
        }
      ]
    }
}

function main(config_data) {
    const inputFilePath = config_data.input_file;
    const outputFilePath = config_data.output_csv_file;
    const outputFormats = config_data.output_format;
    const outputFileJsonPath = config_data.output_json_file;

    /* flagger is not working :( )
    flagger.configure({feature: true}).then(function() {
        const entity = {id: 1};
        console.log('feature is', flag.isEnabled(entity) ? 'enabled' : 'disabled');
    });*/

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

            console.log('flipit testFeature');
            console.log(flipit.isEnabled('testFeature'));
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
        onStartFunctionality();
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
        endFunctionality();
    });  

    function endFunctionality(){
        _.forEach(outputFormats, function (format) {
            let isFormatEnabled = fflip.isFeatureEnabledForUser(format+"OutputProviderOnEnd");
          
            if(isFormatEnabled){
                //call onEnd if only feature is switched on
                knownFormatProviders[format].onEnd();
            }
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
