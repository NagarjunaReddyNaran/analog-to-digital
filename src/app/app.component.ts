import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { Subject } from 'rxjs';
import { HOUR, MINUTE, SECOND } from './constants';
import { TimeoutComponent } from './timeout/timeout.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit {
	hourHandStyle: any;
	minuteHandStyle: any;
	secondHandStyle: any;
	userActivity: any;
	userInactive: Subject<any> = new Subject();

	timerId: any;

	date: Date = new Date();
	hour: number = 0;
	minute: number = 0;
	second: number = 0;
	editTime: boolean = true;
	timeInterval: any;

	time: string | undefined;

	private exportTime = { hour: 7, minute: 15, meriden: 'PM', format: 24 };
	constructor(private router: Router, public dialog: MatDialog) {
		this.setTimeout();
		this.userInactive.subscribe(() => {
			console.log('user has been inactive for 1m');
			this.openDialog();
		});
	}

	// User will be re-directed to Google page after 3 minutes
	setTimeout() {
		this.userActivity = setTimeout(() => {
			this.userInactive.next(undefined);
		}, 180000);
	}

	openDialog() {
		const dialogRef = this.dialog.open(TimeoutComponent);

		dialogRef.afterClosed().subscribe((result) => {
			console.log(`Dialog result: ${result}`);
			if (result) {
				clearTimeout(this.userActivity);
				this.setTimeout();
			} else {
				window.location.href = 'https://www.google.com/';
			}
		});
	}

	@HostListener('window:mousemove')
	private refreshUserState() {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}
	@HostListener('window:keydown', [ '$event' ])
	private handleKeyDown(event: KeyboardEvent) {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}
	@HostListener('document:wheel', [ '$event.target' ])
	onScroll(): void {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}

	ngAfterViewInit(): void {
		this.timerId = this.getTime();
	}

	animateAnalogClock() {
		this.hourHandStyle = {
			transform: `translate3d(-50%, 0, 0) rotate(${this.hour * 30 +
				this.minute * 0.5 +
				this.second * (0.5 / 60)}deg)`
		};

		this.minuteHandStyle = {
			transform: `translate3d(-50%, 0, 0) rotate(${this.minute * 6 + this.second * 0.1}deg)`
		};

		this.secondHandStyle = { transform: `translate3d(-50%, 0, 0) rotate(${this.second * 6}deg)` };
	}

	getTime() {
		this.timeInterval = setInterval(() => {
			let now = new Date();
			let hours = ('0' + now.getHours()).slice(-2);
			let minutes = ('0' + now.getMinutes()).slice(-2);
			let seconds = ('0' + now.getSeconds()).slice(-2);
			let str = hours + ':' + minutes + ':' + seconds;

			this.hour = Number(hours);
			this.minute = Number(minutes);
			this.second = Number(seconds);

			this.animateAnalogClock();
			this.time = str;
		}, 1000);
		return this.timeInterval;
	}

	onChange(event: any, type: string) {
		if (type == HOUR) {
			this.hour = event.target.value;
		}
		if (type == MINUTE) {
			this.minute = event.target.value;
		}
		if (type == SECOND) {
			this.second = event.target.value;
		}
		let str = this.hour + ':' + this.minute + ':' + this.second;
		this.animateAnalogClock();
		this.time = str;
	}

	onTimeChange() {
		this.editTime = !this.editTime;
		if (!this.editTime) {
			clearInterval(this.timeInterval);
		} else {
			this.timerId = this.getTime();
		}
	}
}
