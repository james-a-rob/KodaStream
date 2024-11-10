import {register} from 'module'
import {argv} from 'process'

register('./index.js', import.meta.url, {data: {argv1: argv[1]}})
