# Components

# Components Document
* [FormItems](#FormItems)
* [Pagination](#Pagination)
* [Contextmenu/Menuitem](#Contextmenu/Menuitem)
* [Select/Option](#Select/Option)
* [Datepicker](#Datepicker)
* [Colorpicker](#Colorpicker)
# FormItems
### Description 
* Auto create form items
* text, date picker, select ...
### Path
`components/form-generate.vue`
###  Use
* import FormItems component
* props 
	* searchForm `(Object)`
	* elements `(Array)`
```html
<!-- .vue HTML -->
<template>
	<div>
		<FormItems :searchForm="form"
					:elements="condition"/>
	</div>
</template>
```
```JS
// .vue JavaScript
import FormItems from `@/components/form-items.vue`;
import condition from './condition/condition';
export default {
	data() {
		return {
			form: {
				object_name: '',
				cycle_date: [],
			},
			condition: condition(this)
		}
	}
}
```
```JS
// condition.js

export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 保單 / 表單號碼
            label: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            model: 'object_name',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.PleaseTypePolicy'),
            width: 250,
            optionMap: null
        },
        {
            // 批次日期
            label: _this.$t('Batch') + _this.$t('Date'),
            model: 'cycle_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectPeriod'),
            width: 250,
            optionMap: null,
            datepickerType: 'daterange',
            func: _this.setCycleDate
        }
		...
	]
}
```
### elements (condition)
* Form items object in array
	* `[{item},{item}....]`
### Props
| Name           | type     | Description                                                                                                                                  |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| type           | string   | `text`, `textarea`, `datepicker`, `select`, `switch`, `file`                                                                                 |
| label          | string   | from items label                                                                                                                             |
| model          | object   | bind your object's key                                                                                                                       |
| placeholder    | string   | placeholder                                                                                                                                  |
| width          | number   | item's style width                                                                                                                           |
| optionMap      | object   | something you need transform to people language <br> **only works on** input type `select`                                                   |
| func           | function | `@on-change` to execute <br> **only works on** type `datepicker`                                                                             |
| datepickerType | string   | `date`, `daterange`, `datetime`, `datetimerange`, `year`, `month` <br> **only works on** input type `datepicker`                             |
| multiple       | boolean  | Multiple select dates <br> Default value `false` <br> **only works on** datepickerType `date` <br> **only works on** input type `datepicker` |
| fileMaxSize    | number   | **only works on** type `file` <br> Unit: KB                                                                                                  |
| help           | string   | Tooltips content <br> Can show help icon beside label <br> Hover icon show the tooltips <br> Use v-html, so you can type html code string    |
| disabled       | boolean  | disabled item                                                                                                                                |

# Pagination

### Description 
Pagination component.
* dataPool `(Array)`
	* Origin Data 
* data `(Array)`
	* Display data 
### Path
`@/components/pagination.vue`
### Use
* import appForms component
* v-model `(Number)`
	* page index
* props 
	* dataLength `(Number)`
	* dataPoolLength `(Number)`
	* limit`(Number)`
* emit
	* limitReflash`(Function)`
```HTML
<!-- HTML -->
<pagination  v-model="pageIndex"
			 :data-length="data.length"
			 :data-pool-length="dataPool.length"
			 :limit="pageLimit"
			 @limitReflash="setPagination"/>
```
```JS
// Java Script
import pagination from  '@/components/pagination.vue';
export default {
	data() {
		return {
			data:[]
			dataPool:[]
			pageIndex:0,
			pageLimit:10
		}
	},
	methods: {
		setPagination (limit){
			if(limit)
				this.pageLimit = limit
			this.data = []
			this.data = this.$refs.pagination.handleData(this.dataPool)
		}
	}
}
```
### v-model
Binding your page index
### props params
* dataLen `(Number)`
	* data.length
* dataPoolLen `(Number)`
	* dataPool.length
* limit `(Number)`
	* Single page data limit record
	* `10`, `15`, `20`, `25`, `30`
### @limitReflash
* on limit change
### TODO
* multi v-model
	* `pageLimit`,`data`,`dataPool` ...etc
* single page multi pagination
	* More good design
* maybe don't need @limitReflash

# Contextmenu/Menuitem
### Description 
* Custom context menu and menu item
### Path
* contextmenu
`@/components/contextmenu/contextmenu.vue`
* menuitem
`@/components/contextmenu/menuitem.vue`
### Use
* import contextmenu
* import menuitem
 #### contextmenu
* v-model `(Boolean)`
#### menuitem
* props
	* label `(String)`
	* icon `(String)`
* emit
	* @click `(Function)`
### Normal use
```html
<!-- HTML -->
<Contextmenu  ref="contextmenu"  v-model="contextmenuShow">
	<MenuItem :label="'Edit'" :icon="'md-settings'" @click="edit()" />
	<MenuItem :label="'Delete'" :icon="'md-trash'" @click="delete()"/>
</Contextmenu>
```
```JS
// JavaScript
import Contextmenu from '@/components/contextmenu/contextmenu.vue'
import MenuItem from '@/components/contextmenu/menuitem.vue'
```
### Custom use
```html
<!-- HTML -->
<Contextmenu  ref="contextmenu"  v-model="contextmenuShow">
	<MenuItem>
		<div>Custom elements...</div>
	</MenuItem>
	<MenuItem>
		<Component>Custom Component</Component>
	</MenuItem>
	<!-- you can also... -->
	<MenuItem>
		<Component v-if="show">Custom Component</Component>
		<MenuItem :label="'Delete'" :icon="'md-trash'" @click="show = true"/>
	</MenuItem>
</Contextmenu>
```
#### Contextmenu
* v-model
	* Binding your contextmenu show status
* Function
	* `setPos( posX , posY )`
#### MenuItem
* props 
	* label `(String)`
		* a label of menu Item 
	* icon `(String)`
		* icons from [iView](https://www.iviewui.com/components/icon)
*  @click
	* Execute your function on click menuitem 
### Example
```html
<!-- HTML -->
<template>
	<div>
		<Contextmenu  ref="projectMenu"  v-model="projectMenuShow">
			<MenuItem @click="editProject()" :label="'Edit'" :icon="'ios-create-outline'"/>
			<MenuItem @click="deleteProject()" :label="'Delete'" :icon="'md-trash'"/>
		</Contextmenu>
	</div>
</template>
```
```JS
// JavaScript
import Contextmenu from '@/components/contextmenu/contextmenu.vue'
import MenuItem from '@/components/contextmenu/menuitem.vue'
export default {
	data(){
		return{
			projectMenuShow: false
		}
	},
	methods:{
		editProject(){
			//code ... 
		},
		deleteProject(){
			//code ...
		}
	}
}
```
# Select/Option
### Description 
Custom select element and option
### Path
* Select 
`'@/components/select/select.vue'`
* Option
`'@/components/select/option.vue'`
### Use
* import Select 
* import Option
* avoid conflicting [iview](https://www.iviewui.com/components/select) component name `Select / Option`
#### Select
* v-model
* props
	* placeholder  `(String)`
#### Option
* props
	* value `(Any)`
	* label  `(String)`
### Normal use
```html
<!-- HTML -->
<Selector v-model="from.project" :placeholder="'click to select'">
	<Options v-for="(item,index) in projectList"
			 :value="item.value"
			 :label="item.label"
			 :key="index"/>
</Selector>
```
```JS
// JavaScript
import Selector from '@/components/select/select.vue'
import Options from '@/components/select/option.vue'
```
### Custom use
```html
<!-- HTML -->
<Selector :placeholder="'click to select'">
	<Options  v-for="(item,index) in projectList"
			  :value="item.id"
			  :label="item.name"
			  :key="index">
		<div  class="selectOption" @contextmenu.stop="showProjectMenu($event,item)">
			<div  class="selectOption__title">{{item.name}}</div>
		</div>
	</Options>
</Selector>
```
### Example
```html
<!-- HTML -->
<Selector :placeholder="'click to select'">
	<Options  v-for="(item,index) in projectList"
			  :value="item.id"
			  :label="item.name"
			  :key="index">
		<div  class="selectOption">
			<div  class="selectOption__title">{{item.name}}</div>
		</div>
	</Options>
</Selector>
```
```JS
// JavaScript
import Selector from '@/components/select/select.vue'
import Options from '@/components/select/option.vue'
export default {
	data(){
		return{
			projectList: []
		}
	},
}
```
# Datepicker
### Description 
A simple datepicker: haven't mouth, week, only pick 1-31 date.
### Path
`'@/components/dispatch-datepicker.vue'`
### Use
* import Datepicker
* v-model`(Array)`
* props
	* open `(Boolean)`
	* disabledDate `(Array)`
* emit
	* on-ok `(Function)`
```html
<!-- HTML -->
<Datepicker v-model="dates"
			:open="datePickerShow"
			:disabledDate="disableDate"
			@on-ok="demo()"/>
```
```JS
// JavaScript
import Datepicker from '@/components/dispatch-datepicker.vue'
export default {
	data(){
		return{
			dates: [],
			disableDate:[],
			datePickerShow: false
		}
	},
	methods:{
		demo(){
			// code....
		}
	}
}
```
#### v-model
An array have selected date
`[3,7,8,11]`
* Single object
```JS
{
	value: 1,         // Day 1
	active: false,    // User selected status
	disable: false    // Be disable status
}
```
#### props
* show`(Boolean)`
	* This component display status
* disabledDate`(Array)`
	* Give an array to disable dates
	* ex: `[1,2,9,10,31]` range 1-31
#### emit
* on-ok
	* Execute your function on click ok button
### Example
```html
<!-- HTML -->
<Datepicker v-model="dates"
			:open="datePickerShow"
			:disabledDate="disableDate"
			@on-ok="demo()"/>
```
```JS
// JavaScript
import Datepicker from '@/components/dispatch-datepicker.vue'
export default {
	data(){
		return {
			dates: [],
			disableDate:[],
			datePickerShow: false
		}
	},
	methods:{
		demo(){
			let arr = this.dates //user selected date
			// do someting
		}
	}
}
```
# Colorpicker
### Description 
Use to change event items color
### Path
`'@/components/contextmenu/colorpicker.vue'`
### Use
* import Colorpicker
* props
	* selectEvent `(Array)`
* emit
	* on-change
```html
<!-- HTML -->
<ColorPicker  :selectEvent="getRelatedEvent()"
			  @on-change="setEventColor"/>
```
```JS
// JavaScript
import Colorpicker from '@/components/contextmenu/colorpicker.vue'
export default {
	methods:{
		setEventColor(colorCode){
			// colorCode ex:#616161
			// code ....
		}
	}
}
```
#### props
* selectEvent `(Array)`
	* The related events
	* get the event origin color code
#### emit
* on-change `(Function)`
	* when user change color execute this function
	* return user selected color code `(String)`
### Example
```html
<!-- HTML -->
<ColorPicker  :selectEvent="getRelatedEvent()"
			  @on-change="setEventColor"/>
```
```JS
// JavaScript
import Colorpicker from '@/components/contextmenu/colorpicker.vue'
export default {
	methods:{
		setEventColor(colorCode){
			// colorCode ex:#616161
			// code ....
		},
		getRelatedEvent(){
			// return the all related events
		}
	}
}
```
### TODO
* props `selectEvent`rename `originColor`
* props `RelatedEvent(Array)` change to props `ColorCode(String)`

