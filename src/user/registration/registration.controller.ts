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

class RegistrationController {

  constructor(UserService, $scope, NotificationService, ConstantsGr1d,
  ) {
    'ngInject';

    $scope.logoTheme = ConstantsGr1d.theme.logoSmall;
    $scope.icons = ConstantsGr1d.theme.icons

    $scope.register = function () {
      UserService.register($scope.user).then(function () {
        $scope.formRegistration.$setPristine();
        NotificationService.show('Thank you for registering, you will receive an e-mail confirmation in a fewer minutes');
      });
    };
  }
}

export default RegistrationController;
