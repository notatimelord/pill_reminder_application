import { Injectable } from '@angular/core';

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;
const SpeechGrammarList = (<any>window).SpeechGrammarList || webkitSpeechGrammarList;

@Injectable({
    providedIn: 'root'
})
export class SmartSpeakerService {

    private recognition: any;
    private commands: {
        intent: string;
        keywords: string[];
        callback: (transcript: string) => void;
    }[] = [];
    private grammar: string = "";
    private isListening = false;

    constructor() {
        this.recognition = new webkitSpeechRecognition();
    }

    public initialize() {

        this.grammar = this.createGrammar();
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(this.grammar, 1);

        this.recognition.grammars = speechRecognitionList;

        this.recognition.lang = 'en-US';

    }

    public start() {
        console.log('SERVICE start() ENTERED');
        this.isListening = true;

        if (!this.recognition) {
            console.error('Recognition object is NULL');
            return;
        }

        console.log('Recognition object exists');

        this.recognition.onstart = () => {
            console.log('RECOGNITION STARTED');
        };

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
                .toLowerCase()
                .trim();

            console.log('Heard:', transcript);

            let matchedCommand = null;

            for (const command of this.commands) {
                const match = command.keywords.some(keyword =>
                    transcript.includes(keyword)
                );

                if (match) {
                    matchedCommand = command;
                    break;
                }
            }

            if (matchedCommand) {
                console.log('Matched intent:', matchedCommand.intent);
                matchedCommand.callback(transcript);
            } else {
                this.speak(
                    "I'm sorry, I didn't understand that. You can ask about your medication."
                );
            }
        };

        this.recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                console.warn('No speech detected, retrying...');
                return;
            }

            console.error('Speech recognition error:', event);
        };

        this.recognition.onend = () => {
            console.log('RECOGNITION ENDED');

            // restart only if still listening
            if (this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch { }
                }, 500);
            }
        };

        try {
            this.recognition.start();
            console.log('recognition.start() CALLED');
        } catch (e) {
            console.error('recognition.start() FAILED', e);
        }
    }


    public stop() {
        this.isListening = false;
        this.recognition.stop();
    }

    public addCommand(
        intent: string,
        keywords: string[],
        callback: (transcript: string) => void
    ) {
        this.commands.push({
            intent,
            keywords: keywords.map(k => k.toLowerCase()),
            callback
        });
    }


    public speak(text: string, callback?: Function) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        utterance.voice = speechSynthesis.getVoices()[0];
        utterance.rate = 1;
        utterance.onerror = (event: any) => {
            console.log(event);
        }
        speechSynthesis.speak(utterance);
        if (callback)
            callback();
    }

    private createGrammar() {
        let grammar = '#JSGF V1.0; grammar commands; public <command> = ';
        for (let command in this.commands) {
            grammar += command.split(" ").join(" | ") + ' | ';
        }
        grammar = grammar.slice(0, grammar.length - 3);
        return grammar + ' ;';
    }

    public refreshGrammar() {
        this.grammar = this.createGrammar();
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(this.grammar, 1);
        this.recognition.grammars = speechRecognitionList;
    }

}