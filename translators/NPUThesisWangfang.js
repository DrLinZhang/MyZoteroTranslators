{
	"translatorID": "d7c54cfc-6b6b-4aeb-af43-5a4d44a13666",
	"label": "NPU Thesis Wangfang",
	"creator": "DrZhang<DrZhang@mail.nwpu.edu.cn>",
	"target": "xwlw.nwpu.edu.cn",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2023-05-02 22:52:58"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Zhanglin
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	// TODO: adjust the logic here

	if (url.includes('thesis')) {
		return "thesis";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}

	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var iframe = false;
	var iframedoc = {};

	if (doc.getElementsByTagName('iframe').length > 1) {
		iframe = true;
		iframedoc = doc.getElementsByTagName('iframe')[0].contentWindow.document;
	}

	var rows = doc.querySelectorAll("a[href*='/thesis/']");

	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	// Z.debug(items);
	if (found) {
		return items;
	} else if (iframe) {
		return getSearchResults(iframedoc, checkOnly);
	} else {
		return false;
	}

}

function doWeb(doc, url) {
	// ZU.processDocuments( ["http://xwlw.nwpu.edu.cn:81/thesis/242960"], scrape) ;
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
			// Z.debug(Object.keys(items))
		});
	}
	else {
		scrape(doc, url);
	}
}

function getvalue(doc, tag) {
	var s = doc.querySelector('span[text*="' + tag + '"]');
	if (s && s.childNodes.length > 0)
		return s.parentElement.nextElementSibling.children[0].innerText;
	else
		return "";
}

function gettagvalue(doc, tag) {
	var a = doc.querySelector('span[text*="' + tag + '"]');
	var tags = a.parentElement.nextElementSibling.children[0].children;

	var taglist = [];

	for (var i = 0, n = tags.length; i < n; i++) {
		taglist[i] = tags[i].innerText;
	}
	//Z.debug(taglist);
	return taglist;
}

function gettrvalue(doc, tag) {
	var s = doc.querySelector('td[text*="' + tag + '"]');
	if (s && s.childNodes.length > 0)
		return s.parentElement.innerText + s.parentElement.nextElementSibling.innerText;
	else
		return "";
}

function getextrainfo(doc, array) {
	arr = [];
	for (i = 0; i < array.length; i++) {
		s = gettrvalue(doc, array[i]);

		if (s && s.length) {
			ss = ZU.trimInternal(s);
			arr.push(ss);
		}
	}
	return arr.join('\n');
}

function handleName(authors, isContri) {
	var creators = [];
	for (let author of authors) {

		var creator = {};
		var lastSpace = author.lastIndexOf(',');
		if (author.search(/[A-Za-z]/) !== -1 && lastSpace !== -1) {
			// English
			creator.lastName = author.slice(0, lastSpace);
			creator.firstName = author.slice(lastSpace + 1);
		}
		if (isContri) {
			creator.creatorType = "contributor";
		}
		creators.push(creator);
	}

	//Z.debug(creators);
	return creators;
}

var keydict = {
	'分类号': 'classNumber',
	'学院': 'collegeName',
	'英文标题': 'engTitle',
	'专业': 'major',
	'学号': 'studentNumber'
}

function getjsonextrainfo(json, array) {

	arr = [];
	for (i = 0; i < array.length; i++) {
		s = array[i] + ":" + json.data[keydict[array[i]]];

		if (s && s.length) {
			ss = ZU.trimInternal(s);
			arr.push(ss);
		}
	}
	return arr.join('\n');
}


function scrapeold(doc, url) {
	// init 
	// var td
	// Z.debug(url);
	Z.debug(detectWeb(doc, url));
	// Z.debug(doc);
	// Z.debug("scrape");
	for (var td of doc.querySelectorAll('span[class*=Thesis]')) {
		td.setAttribute('text', td.innerText);
	}
	// Z.debug(doc.querySelector('span[text*="论文题名(中文)"]').innerText);

	// get value 
	var title = getvalue(doc, "论文题名(中文)");
	var abstractNoteCN = getvalue(doc, "论文摘要(中文)");
	var abstractNoteEN = getvalue(doc, "论文摘要(外文))");
	var abstractNote = abstractNoteCN + '\n' + abstractNoteEN;
	var university = getvalue(doc, "学校名称");
	var thesisType = getvalue(doc, "作者学位");
	var place = "西安";
	var date = getvalue(doc, "论文完成日期");
	// var numPages = getvalue(doc, "论文总页码")
	var language = getvalue(doc, "论文语种");
	var accessDate = getvalue(doc, "开放日期");
	var libraryCatalog = "NPU Thesis";
	var extra = getextrainfo(doc, ["论文题名(外文)", "作者学院", "所属专业", "导师姓名"]);
	var authors = getvalue(doc, "作者：");
	var supervisor = getvalue(doc, "导师姓名");

	//  Z.debug(title);           
	//  Z.debug(abstractNote);    
	//	Z.debug(university);      
	//	Z.debug(thesisType);      
	//	Z.debug(place);           
	//	Z.debug(date);            
	//	Z.debug(numPages);        
	//	Z.debug(language);        
	//	Z.debug(url);             
	//	Z.debug(accessDate);      
	//	Z.debug(libraryCatalog);  
	//	Z.debug(extra);           
	//  Z.debug(authors);   
	//  Z.debug(supervisor); 
	Z.debug("Debuging  ..... ");

	// Set item 
	var newItem = new Zotero.Item("thesis");  // 新建一个新闻条目，后面把信息填入到对应字段
	if (title.length) {
		Z.debug(title);
		newItem.title = ZU.trimInternal(title);
		//Z.debug(title); 
	}

	Z.debug(authors);
	if (authors.length) {
		//Z.debug(authors);
		authors = new Array(ZU.trimInternal(authors));
		//authors = handleName(authors,false);
		Z.debug(authors);
	}

	if (supervisor.length) {

		//导师可能有多个,具体以什么符号分割还未核实
		supervisor = new Array(ZU.trimInternal(supervisor));
		//Z.debug(supervisor);
		//supervisor=handleName(supervisor,true);
		Z.debug(supervisor);
	}
	var creatorss = [];
	if (supervisor.length || authors.length) {
		creatorss = authors.concat(supervisor);
		Z.debug(newItem.creators);
	}

	//	if(numPages.length){
	//		newItem.numPages=ZU.trimInternal(numPages);
	//	}

	if (date.length) {
		newItem.date = ZU.trimInternal(date);
	}

	if (university.length) {
		newItem.university = ZU.trimInternal(university);
	}

	if (place.length) {
		newItem.place = ZU.trimInternal(place);
	}

	if (thesisType.length) {
		newItem.thesisType = ZU.trimInternal(thesisType);
	}

	if (language.length) {
		newItem.language = ZU.trimInternal(language);
	}

	if (abstractNote.length) {
		newItem.abstractNote = ZU.trimInternal(abstractNote);
	}

	if (accessDate.length) {
		newItem.accessDate = ZU.trimInternal(accessDate);
	}

	newItem.url = url;
	newItem.libraryCatalog = libraryCatalog;
	newItem.extra = extra;

	var tagc = gettagvalue(doc, "关键词(中文)");
	var tage = gettagvalue(doc, "关键词(外文)");
	var taga = [];
	taga = taga.concat(tagc);
	taga = taga.concat(tage);

	if (taga.length)
		for (var i = 0, n = taga.length; i < n; i++) {
			newItem.tags.push({ tag: taga[i] });
		}
	Z.debug(taga)



	// split names, Chinese name split depends on Zotero Connector preference translators.zhnamesplit

	var zhnamesplit = Z.getHiddenPref('zhnamesplit');
	if (zhnamesplit === undefined) {
		zhnamesplit = true;
	}
	zhnamesplit = false;
	Z.debug(newItem.creators)
	//	Z.debug( newItem.creators.length)

	for (var i = 0, n = creatorss.length; i < n; i++) {
		var creator = { lastName: creatorss[i], firstName: "", creatorType: 'author' };
		Z.debug(creator)
		if (newItem.itemType == 'thesis' && i == n - 1) {  // The last author is Advisor in thesis
			creator.creatorType = 'contributor';  // Here is contributor
		}
		if (creator.firstName) continue;

		var lastSpace = creator.lastName.lastIndexOf(' ');
		if (creator.lastName.search(/[A-Za-z]/) !== -1 && lastSpace !== -1) {
			// western name. split on last space
			creator.firstName = creator.lastName.substr(0, lastSpace);
			creator.lastName = creator.lastName.substr(lastSpace + 1);
		}
		else if (zhnamesplit) {
			// zhnamesplit is true, split firstname and lastname.
			// Chinese name. first character is last name, the rest are first name
			creator.firstName = creator.lastName.substr(1);
			creator.lastName = creator.lastName.charAt(0);
		}
		newItem.creators.push(creator);
	}

	// clean up tags. Remove numbers from end
	//	for (var j = 0, l = newItem.tags.length; j < l; j++) {
	//		newItem.tags[j] = newItem.tags[j].replace(/:\d+$/, '');
	//	}

	if (newItem.abstractNote) {
		newItem.abstractNote = newItem.abstractNote.replace(/\s*[\r\n]\s*/g, '\n')
			.replace(/&lt;.*?&gt;/g, "");
	}
	newItem.title = ZU.trimInternal(newItem.title);

	pdfurl = doc.querySelector('a[href*="pdf"]').href;

	Z.debug(pdfurl);

	newItem.attachments.push(
		{
			title: title + '.pdf',
			mimeType: "application/pdf",
			url: pdfurl
		}

	);

	newItem.complete();

}


function scrape(doc, url) { //API
	//init 
	// var td
	Z.debug(url);
	Z.debug(detectWeb(doc, url));
	//Z.debug(doc);
	var thesisid = url.split('/').pop();
	var jsonURL =  window.location.origin + '/apple/api/nutshell/search/thesis/' + thesisid;

	ZU.doGet(jsonURL, function (text) {
		var isValidJSON = true;
		try {
			JSON.parse(text);
		}
		catch (e) {
			isValidJSON = false;
		}
		if (isValidJSON) {
			var json = JSON.parse(text);


			// get value 
			var title = json.data.title;
			var abstractNoteCN = json.data.thesisAbstract;
			var abstractNoteEN = json.data.engThesisAbstract;
			var abstractNote = abstractNoteCN + '\n' + abstractNoteEN;
			var university = json.data.school;
			var thesisType = json.data.typeName;
			var place = "西安";
			var date = new Date(json.data.completeDate).toJSON();
			var numPages = json.data.pageCount
			var language = json.data.language;
			var accessDate = new Date(json.data.openDate).toJSON();
			var libraryCatalog = "NPU Thesis";

			var authors = json.data.studentName;

			var supervisor = json.data.turtorName1;

			var extra = getjsonextrainfo(json, ["学号", "英文标题", "学院", "专业", "分类号"]);

			// if ( json.data.turtorName2 != ""){
			// supervisor = supervisor + ";"
			// }

			//Z.debug(title);           
			//Z.debug(abstractNote);    
			//	Z.debug(university);      
			//	Z.debug(thesisType);      
			//	Z.debug(place);           
			//	Z.debug(date);            
			//	Z.debug(numPages);        
			//	Z.debug(language);        
			//	Z.debug(url);             
			//	Z.debug(accessDate);      
			//	Z.debug(libraryCatalog);  
			//	Z.debug(extra);           
			//Z.debug(authors);   
			//Z.debug(supervisor); 
			Z.debug("Debuging  ..... ");

			// Set item 
			var newItem = new Zotero.Item("thesis");  // 新建一个新闻条目，后面把信息填入到对应字段
			if (title.length) {
				Z.debug(title);
				newItem.title = ZU.trimInternal(title);
				//Z.debug(title); 
			}

			Z.debug(authors);
			if (authors.length) {
				//Z.debug(authors);
				authors = new Array(ZU.trimInternal(authors));
				//authors = handleName(authors,false);
				Z.debug(authors);
			}

			if (supervisor.length) {

				//导师可能有多个,具体以什么符号分割还未核实
				supervisor = new Array(ZU.trimInternal(supervisor));
				//Z.debug(supervisor);
				//supervisor=handleName(supervisor,true);
				Z.debug(supervisor);
			}
			var creatorss = [];
			if (supervisor.length || authors.length) {
				creatorss = authors.concat(supervisor);
				Z.debug(newItem.creators);
			}

			if (numPages.length) {
				newItem.numPages = ZU.trimInternal(numPages);
			}

			if (date.length) {
				newItem.date = ZU.trimInternal(date);
			}

			if (university.length) {
				newItem.university = ZU.trimInternal(university);
			}

			if (place.length) {
				newItem.place = ZU.trimInternal(place);
			}

			if (thesisType.length) {
				newItem.thesisType = ZU.trimInternal(thesisType);
			}

			if (language.length) {
				newItem.language = ZU.trimInternal(language);
			}

			if (abstractNote.length) {
				newItem.abstractNote = ZU.trimInternal(abstractNote);
			}

			if (accessDate.length) {
				newItem.accessDate = ZU.trimInternal(accessDate);
			}

			newItem.url = url;
			newItem.libraryCatalog = libraryCatalog;
			newItem.extra = extra;

			var tagc = json.data.keyword.split(';');
			var tage = json.data.engKeyword.split(';');

			var taga = [];
			taga = taga.concat(tagc);
			taga = taga.concat(tage);

			if (taga.length)
				for (var i = 0, n = taga.length; i < n; i++) {
					newItem.tags.push({ tag: taga[i] });
				}
			//newItem.tags = taga
			Z.debug(taga)
			// var author = getvalue(doc, "作者姓名")
			// // var sup = getvalue(doc, "导师姓名")
			// newItem.creators.push({lastName:author, creatorType:'author'});  // 创建者信息，参考文本翻译器编写官方文档
			// split names, Chinese name split depends on Zotero Connector preference translators.zhnamesplit

			var zhnamesplit = Z.getHiddenPref('zhnamesplit');
			if (zhnamesplit === undefined) {
				zhnamesplit = true;
			}
			zhnamesplit = false;
			Z.debug(newItem.creators);
			//	Z.debug( newItem.creators.length);

			for (var i = 0, n = creatorss.length; i < n; i++) {
				var creator = { lastName: creatorss[i], firstName: "", creatorType: 'author' };
				Z.debug(creator)
				if (newItem.itemType == 'thesis' && i == n - 1) {  // The last author is Advisor in thesis
					creator.creatorType = 'contributor';  // Here is contributor
				}
				if (creator.firstName) continue;

				var lastSpace = creator.lastName.lastIndexOf(' ');
				if (creator.lastName.search(/[A-Za-z]/) !== -1 && lastSpace !== -1) {
					// western name. split on last space
					creator.firstName = creator.lastName.substr(0, lastSpace);
					creator.lastName = creator.lastName.substr(lastSpace + 1);
				}
				else if (zhnamesplit) {
					// zhnamesplit is true, split firstname and lastname.
					// Chinese name. first character is last name, the rest are first name
					creator.firstName = creator.lastName.substr(1);
					creator.lastName = creator.lastName.charAt(0);
				}
				newItem.creators.push(creator);
			}

			// clean up tags. Remove numbers from end
			//	for (var j = 0, l = newItem.tags.length; j < l; j++) {
			//		newItem.tags[j] = newItem.tags[j].replace(/:\d+$/, '');
			//	}

			if (newItem.abstractNote) {
				newItem.abstractNote = newItem.abstractNote.replace(/\s*[\r\n]\s*/g, '\n')
					.replace(/&lt;.*?&gt;/g, "");
			}
			newItem.title = ZU.trimInternal(newItem.title);

			pdfurl = json.data.fullText.fileUrl;

			Z.debug(pdfurl);

			newItem.attachments.push(
				{
					title: title + '.pdf',
					mimeType: "application/pdf",
					url: pdfurl
				}

			);

			newItem.complete();


		}
	});


}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://xwlw.nwpu.edu.cn:81/thesis/246827",
		"items": [
			{
				"itemType": "thesis",
				"title": "枝晶生长的元胞自动机模型研究",
				"creators": [
					{
						"lastName": "魏雷",
						"firstName": "",
						"creatorType": "author"
					},
					{
						"lastName": "黄卫东",
						"firstName": "",
						"creatorType": "contributor"
					}
				],
				"date": "2013-02-25T04:13:10.000Z",
				"abstractNote": "精确且高效的凝固组织模拟是目前凝固科学研究的一条重要途径，同时，也对指导实际凝固控制在工业中应用具有重要的工程价值。枝晶生长的元胞自动机(Cellular Automaton,CA)模型具有较高的计算效率，以及相对简洁的物理原理，最近成为了凝固组织研究的热点。CA模型从最初的建立到目前的发展，其所预测的组织演化行为往往容易受到网格各向异性的影响，进而制约了CA模型预测的物理准确性以及精度。本文针对传统CA模型所存在的网格各向异性问题，研究了界面捕获规则，界面曲率计算，界面生长动力学在网格各向异性中的作用机制，并提出了改进算法。并在此基础上，建立了包含界面重构的二维CA模型和采用自适应网格的三维CA模型。取得的主要成果如下： \"",
				"extra": "学号:057040124\n英文标题:Cellular Automaton Method for Dendrite Growth\n学院:材料学院\n专业:材料加工工程\n分类号:TG248",
				"language": "zh",
				"libraryCatalog": "NPU Thesis",
				"place": "西安",
				"thesisType": "博士",
				"university": "西北工业大学",
				"url": "http://xwlw.nwpu.edu.cn:81/thesis/246827",
				"attachments": [
					{
						"title": "枝晶生长的元胞自动机模型研究.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "元胞自动机"
					},
					{
						"tag": "凝固技术"
					},
					{
						"tag": "微观组织"
					},
					{
						"tag": "枝晶生长"
					},
					{
						"tag": "界面能各向异性"
					},
					{
						"tag": "界面重构"
					},
					{
						"tag": "自适应网格"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://xwlw.nwpu.edu.cn:81/thesis/237261",
		"items": [
			{
				"itemType": "thesis",
				"title": "DZ125高温合金恒速和跃迁变速定向凝固组织演化研究与数值模拟",
				"creators": [
					{
						"lastName": "郭勇冠",
						"firstName": "",
						"creatorType": "author"
					},
					{
						"lastName": "李双明",
						"firstName": "",
						"creatorType": "contributor"
					}
				],
				"date": "2008-03-25T16:00:00.000Z",
				"abstractNote": "本文采用有限元与CA模型相耦合的方法模拟了DZ125高温合金定向凝固中的微观组织演变。考虑到DZ125高温合金是多元合金，本文采用伪二元法对其进行合理简化，利用有限元软件模拟了定向凝固过程宏观温度场，并将其插值到微观模拟区域。在微观区域模拟时采用CA模型，模拟过程中考虑了形核位置的随机分布、枝晶尖端生长动力学、曲率以及固液相之间的溶质再分配，将每个时间步长的温度场，溶质场以及所有元胞的状态变化同步显示，实现了定向凝固过程中微观组织的模拟，并将模拟结果与实验结果进行对比，讨论了DZ125高温合金恒速和跃迁变速定向凝固过程中微观组织演变规律，通过上述研究获得的主要结论如下： Based on the CA-FE method, directionally solidified microstructures of DZ125 superalloy have been simulated. DZ125 multicomponent superalloy is simplified as a pseudobinary alloy and the macroscopic temperature field has been obtained by the Finite Element software during directional solidification. Then, the temperature field is discreted and interpolated into the microscopic simulation domain. Taking into account continuous nucleation model, dendritic growth kinetics of a dendrite tip, curvature and solute redistribution of solid/liquid interface, directionally solidified microstructures of DZ125 superalloy have been simulated by 2D Cellular Automation method. Simultaneously, the simulation results, involving the distribution of temperature and solute, the state of discreted cells have been displayed directly. At last, directionally solidified microstructures of DZ125 superalloy have been investigated both at constant growth rates and at the change growth rates with the simulate results and experimental results. The main results in this paper can be summarized as follows:",
				"extra": "学号:056046146\n英文标题:Simulation and Research on the Microstructure Evolution of DZ125 Superalloy at Constant and Changing Growth Rates under Directional Solidification\n学院:材料学院\n专业:材料加工工程\n分类号:TG249",
				"language": "zh",
				"libraryCatalog": "NPU Thesis",
				"place": "西安",
				"thesisType": "硕士",
				"university": "西北工业大学",
				"url": "http://xwlw.nwpu.edu.cn:81/thesis/237261",
				"attachments": [
					{
						"title": "DZ125高温合金恒速和跃迁变速定向凝固组织演化研究与数值模拟.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " cellular automaton"
					},
					{
						"tag": "DZ125 superalloy"
					},
					{
						"tag": "DZ125高温合金"
					},
					{
						"tag": "directional solidification"
					},
					{
						"tag": "microstructure simulation"
					},
					{
						"tag": "元胞自动机"
					},
					{
						"tag": "定向凝固"
					},
					{
						"tag": "微观模拟"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
