/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    // granularity
    import TimelineGranularityData = granularity.TimelineGranularityData;

    // settings
    import WeekDaySettings = settings.WeekDaySettings;
    import CalendarSettings = settings.CalendarSettings;

    interface DateDictionary {
        [year: number]: Date;
    }

    export interface PeriodDates {
        startDate: Date;
        endDate: Date;
    }

    export class Calendar {
        private static QuarterFirstMonths: number[] = [0, 3, 6, 9];

        private firstDayOfWeek: number;
        private firstMonthOfYear: number;
        private firstDayOfYear: number;
        private dateOfFirstWeek: DateDictionary;
        private quarterFirstMonths: number[];

        public getFirstDayOfWeek(): number {
            return this.firstDayOfWeek;
        }

        public getFirstMonthOfYear(): number {
            return this.firstMonthOfYear;
        }

        public getFirstDayOfYear(): number {
            return this.firstDayOfYear;
        }

        public getNextDate(date: Date): Date {
            return TimelineGranularityData.nextDay(date);
        }

        public getWeekPeriod(date: Date): PeriodDates {
            const year: number = date.getFullYear();
            const month: number = date.getMonth();

            let dayOfWeek: number = date.getDay();
            let deltaDays: number = 0;
            if (this.firstDayOfWeek !== dayOfWeek) {
                deltaDays = dayOfWeek - this.firstDayOfWeek;
            }

            if (deltaDays < 0) {
                deltaDays = 7 + deltaDays;
            }

            let startDate = new Date(year, month, date.getDate() - deltaDays);
            let endDate = new Date(year, month, startDate.getDate() + 7);

            return {startDate, endDate};
        }

        public getQuarterIndex(date: Date): number {
            return Math.floor(date.getMonth() / 3);
        }

        public getQuarterStartDate(year: number, quarterIndex: number): Date {
            return new Date(year, this.quarterFirstMonths[quarterIndex], this.firstDayOfYear);
        }

        public getQuarterEndDate(date: Date): Date {
            return new Date(date.getFullYear(), date.getMonth() + 3, this.firstDayOfYear);
        }

        public getQuarterPeriod(date: Date): PeriodDates {
            const quarterIndex = this.getQuarterIndex(date);

            let startDate: Date = this.getQuarterStartDate(date.getFullYear(), quarterIndex);
            let endDate: Date = this.getQuarterEndDate(startDate);

            return {startDate, endDate};
        }

        public getMonthPeriod(date: Date): PeriodDates {
            const year: number = date.getFullYear();
            const month: number = date.getMonth();

            let startDate: Date = new Date(year, month, this.firstDayOfYear);
            let endDate: Date = new Date(year, month + 1, this.firstDayOfYear);

            return {startDate, endDate};
        }

        public getYearPeriod(date: Date): PeriodDates {
            const year: number = date.getFullYear();

            let startDate: Date = new Date(year, this.firstMonthOfYear, this.firstDayOfYear);
            let endDate: Date = new Date(year + 1, this.firstMonthOfYear, this.firstDayOfYear);

            return {startDate, endDate};
        }

        public isChanged(
            calendarSettings: CalendarSettings,
            weekDaySettings: WeekDaySettings): boolean {

            return this.firstMonthOfYear !== calendarSettings.month
                || this.firstDayOfYear !== calendarSettings.day
                || this.firstDayOfWeek !== weekDaySettings.day;
        }

        constructor(
            calendarFormat: CalendarSettings,
            weekDaySettings: WeekDaySettings) {

            this.firstDayOfWeek = weekDaySettings.day;
            this.firstMonthOfYear = calendarFormat.month;
            this.firstDayOfYear = calendarFormat.day;

            this.dateOfFirstWeek = {};

            this.quarterFirstMonths = Calendar.QuarterFirstMonths.map((monthIndex: number) => {
                return monthIndex + this.firstMonthOfYear;
            });
        }

        private calculateDateOfFirstWeek(year: number): Date {
            let date: Date = new Date(year, this.firstMonthOfYear, this.firstDayOfYear);

            while (date.getDay() !== this.firstDayOfWeek) {
                date = TimelineGranularityData.nextDay(date);
            }

            return date;
        }

        public getDateOfFirstWeek(year: number): Date {
            if (!this.dateOfFirstWeek[year]) {
                this.dateOfFirstWeek[year] = this.calculateDateOfFirstWeek(year);
            }

            return this.dateOfFirstWeek[year];
        }
    }
}
