/*
 * Copyright (C) 2016 OpenMotics BVBA
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {inject, Aurelia} from "aurelia-framework";
import {Router} from "aurelia-router";
import {API} from "./api";
import Shared from "./shared";
import {Storage} from "./storage";

@inject(Aurelia, Router, API)
export class Authentication {
    constructor(aurelia, router, api) {
        this.aurelia = aurelia;
        this.router = router;
        this.api = api;
        this.wizards = Shared.wizards;
    }

    get isLoggedIn() {
        return this.api.token !== undefined;
    }

    async logout() {
        this.api.token = undefined;
        Storage.removeItem('token');
        for (let wizardController of this.wizards) {
            wizardController.cancel();
        }
        await this.aurelia.setRoot('users', document.body);
        return this.router.navigate('login');
    };

    async login(username, password, timeout) {
        let data = await this.api.login(username, password, timeout, {ignore401: true});
        this.api.token = data.token;
        Storage.setItem('token', data.token);
        await this.aurelia.setRoot('index', document.body);
        return this.router.navigate(Storage.getItem('last') || 'dashboard');
    };
}
