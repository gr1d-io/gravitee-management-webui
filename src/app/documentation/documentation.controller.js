/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global document:false */
class DocumentationController {
  
	constructor(DocumentationService, $mdDialog, baseURL, $location) {
    'ngInject';
    this.DocumentationService = DocumentationService;
    this.$mdDialog = $mdDialog;
    this.selected = null;
    this.pages = [ ];
		this.previewMode = true;
		this.editMode = false;
		this.MARKDOWN_PAGE = 'MARKDOWN';
    this.RAML_PAGE = 'RAML';
  	this.SWAGGER_PAGE = 'SWAGGER';
		this.baseURL = baseURL;
		this.contentPageURL = baseURL;
    this.dataHasLoaded = false;
    this.location = $location;
    this.init();
  }

  selectPage(page) {
    this.selected = angular.isNumber(page) ? this.pages[page] : page;
    this.location.hash(page.name);
  }

  init() {
    // TODO get the real api name
    var apiName = "TEST";
		this.preview();
    this.DocumentationService.list(apiName).then(response => {
      this.pages = response.data;
			if (this.pages.length > 0) {
        var currentPageName = this.location.hash();
        var pageIndex = 0;
        for (var i = 0; i < this.pages.length; i++) {
          if (this.pages[i].name === currentPageName) {
            pageIndex = i;
            break;
          }
        }
        this.selected = this.pages[pageIndex];
				this.dataHasLoaded = true;
				this.contentPageURL = this.baseURL + 'documentation/pages/' + this.selected.name + '/content';
			}
    });
  }

  list() {
    // TODO get the real api name
    var apiName = "TEST";
    this.DocumentationService.list(apiName).then(response => {
      this.pages = response.data;
      this.selected = this.pages[this.pages.length - 1];
			this.contentPageURL = this.baseURL + 'documentation/pages/' + this.selected.name + '/content';
    });
  }

  editPage() {
    var self = this;
    var editPage = {
      "title" : this.selected.title,
      "content": this.selected.content
    };
    this.DocumentationService.editPage(this.selected.name, editPage).then(function () {
        self.init();
    });
  }

  deletePage() {
    if (confirm("Are you sure to delete")) {
      var self = this;
      this.DocumentationService.deletePage(this.selected.name).then(function () {
				self.pages.slice(self.selected);	
        self.init();
      });
    }
  }

  showNewPageDialog(event) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogDocumentationController,
      templateUrl: 'app/documentation/documentation.dialog.html',
      parent: angular.element(document.body),
    }).then(function (response) {
			self.edit();
      self.list();
    });
  }

	// swith mode (edit/preview)
	edit() {
		this.editMode = true;
		this.previewMode = false;
	}

	preview() {
		this.editMode = false;
		this.previewMode = true;
	}

	ramlPreviewMode() {
		return this.previewMode && this.RAML_PAGE === this.selected.type;
	}

	markdownPreviewMode() {
		return this.previewMode && this.MARKDOWN_PAGE === this.selected.type;
	}
}

function DialogDocumentationController($scope, $mdDialog, DocumentationService) {
  'ngInject';

  $scope.MARKDOWN_PAGE = 'MARKDOWN';
  $scope.RAML_PAGE = 'RAML';
  $scope.SWAGGER_PAGE = 'SWAGGER';
  $scope.selectedPageType = null;
  $scope.pageTitle = null;

  $scope.hide = function(){
    $mdDialog.hide();
  };

  $scope.selectPageType = function(pageType) {
    $scope.selectedPageType = pageType;
  };

  $scope.createPage = function() {
    if ($scope.selectedPageType != null && ($scope.pageTitle != null && $scope.pageTitle.trim() != '')) {
      var newPage = {
        "name" : $scope.pageTitle.replace(/\s/g, "-").toLowerCase(),
        "type" : $scope.selectedPageType,
        "title" : $scope.pageTitle,
        "apiName": "TEST"
      };
      DocumentationService.createPage(newPage).then(function (page) {
        $mdDialog.hide(page);
      }).catch(function (error) {
        $scope.error = error;
      });
    }
  };
}

export default DocumentationController;