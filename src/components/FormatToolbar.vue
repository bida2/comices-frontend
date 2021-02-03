<template>
    <v-card color="grey lighten-4" class="mx-auto" flat max-width="600px" tile>
        <v-toolbar flat dense>
            <v-toolbar-title>Editing Tools</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="formatText('strong')" icon>
                <v-icon>mdi-format-bold</v-icon>
            </v-btn>
            <v-btn @click="formatText('del')" icon>
                <v-icon>mdi-format-strikethrough-variant</v-icon>
            </v-btn>
            <v-btn @click="formatText('u')" icon>
                <v-icon>mdi-format-underline</v-icon>
            </v-btn>
        </v-toolbar>
    </v-card>
</template>
<script>
import eventHub from '@/main.js'
import { replaceStringAt } from '@/common.js'
export default {
    data: () => ({
       result: ''
    }),
    methods: {
        formatText(formatTag) {
            let elem_offset = window.getSelection().anchorOffset;
            let elem = window.getSelection().anchorNode.childNodes[elem_offset];
            let formatContent = elem.value.indexOf(window.getSelection().toString(), elem.selectionStart);
            let selContent = elem.value.substr(formatContent, elem.selectionEnd - elem.selectionStart);
            if (!elem.id.includes("content") && !elem.id.includes("title")) {
                eventHub.$emit("notifyUser", "Formatting not available for this field!");
                return false;
            }
            if (elem.id.includes("title") && (formatContent !== -1 && selContent.length > 0)) {
                let editStr = '<' + formatTag + '>' + selContent + '</' + formatTag + '>';
                this.result = replaceStringAt(elem.value, formatContent, formatContent + selContent.length, editStr);
                eventHub.$emit("formatText", "title", this.result);
                return true;
            }
            if (elem.id.includes("content") && (formatContent !== -1 && selContent.length > 0)) {
                let editStr = '<' + formatTag + '>' + selContent + '</' + formatTag + '>';
                this.result = replaceStringAt(elem.value, formatContent, formatContent + selContent.length, editStr);
                eventHub.$emit("formatText", "content", this.result);
            }
        },
    }
}
</script>