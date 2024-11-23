import { Component } from '@angular/core';

@Component({
	selector: 'app-menu-bar',
	templateUrl: './menu-bar.component.html',
	styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent {
	isMenuOpen = false;

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
	}
}
