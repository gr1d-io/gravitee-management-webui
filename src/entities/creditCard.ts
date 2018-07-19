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
import { PersonalInfo } from "./personalInfo";

export class CreditCard {
    public card_first_digits: string;
    public card_holder_name: string;
    public card_last_digits: string;
    public valid: boolean = false;
    public personal_info: PersonalInfo; 
    constructor() {
      'ngInject';
    }
  }