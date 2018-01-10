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
import * as angular from 'angular';
import UserService from '../../services/user.service';
import * as _ from "lodash";

class ApplicationsController {
  private applications: any;
  private applicationsToDisplay: any;
  private selectedApplications: any;
  private subMessage: string;

  constructor(
    private $mdDialog: ng.material.IDialogService,
    private $state: ng.ui.IStateService,
    private $rootScope,
    private UserService: UserService,
    private $filter
  ) {
		'ngInject';
		this.selectedApplications = [];

		const that = this;
    UserService.current().then(function (user) {
      if (!user.username) {
        that.subMessage = 'Login to get access to your applications';
      } else if (UserService.isUserHasPermissions(['management-application-c'])) {
        that.subMessage = 'Start creating an application';
      } else {
        that.subMessage = '';
      }
    });
	}

	createInitApplication() {
		if (!this.$rootScope.graviteeUser) {
			this.$rootScope.$broadcast('authenticationRequired');
		} else {
			this.showAddApplicationModal(null);
		}
	}

	showAddApplicationModal(ev) {
    let that = this;
    this.$mdDialog.show({
      controller: 'DialogApplicationController',
      template: require('./dialog/application.dialog.html'),
      parent: angular.element(document.body),
			targetEvent: ev,
      clickOutsideToClose: true
    }).then(function (application) {
      if (application) {
        that.$state.go('management.applications.portal.general', {applicationId: application.data.id}, {reload: true});
      }
    }, function() {
       // You cancelled the dialog
    });
  }

  loadMore = function (order, searchApplications, showNext) {
    const doNotLoad = showNext && (this.applications && this.applications.length) === (this.applicationsToDisplay && this.applicationsToDisplay.length);
    if (!doNotLoad && this.applications && this.applications.length) {
      let applications = _.clone(this.applications);
      if (searchApplications) {
        applications = this.$filter('filter')(applications, searchApplications);
      }
      applications = _.sortBy(applications, _.replace(order, '-', ''));
      if (_.startsWith(order, '-')) {
        applications.reverse();
      }
      let applicationsLength = this.applicationsToDisplay? this.applicationsToDisplay.length:0;
      this.applicationsToDisplay = _.take(applications, 20 + applicationsLength);
    }
  }
}

export default ApplicationsController;
