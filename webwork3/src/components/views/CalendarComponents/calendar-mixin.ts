import { Vue, Component, Prop } from "vue-property-decorator";

import dayjs from "dayjs";

import { ProblemSetList } from "@/store/models";

import { getModule } from "vuex-module-decorators";

import settings_module from "@/store/modules/settings";
const settings_store = getModule(settings_module);

export interface AssignmentInfo {
  date: dayjs.Dayjs;
  type: string;
  set_id: string;
  due_date?: dayjs.Dayjs;
}

// You can declare a mixin as the same style as components.
@Component
export default class CalendarMixin extends Vue {
  @Prop() private first_day_of_week!: dayjs.Dayjs;
  @Prop() private problem_sets!: ProblemSetList;
  @Prop() private all_assignment_dates!: AssignmentInfo[];

  private today: dayjs.Dayjs = dayjs();

  // returns the class for proper coloring of the calendar
  public dayClass(day: dayjs.Dayjs): string {
    return this.today.isSame(day, "day")
      ? "today"
      : this.today.isSame(day, "month")
      ? "current-month"
      : day.month() % 2 === 0
      ? "even-month"
      : "odd-month";
  }

  public shortDate(day: dayjs.Dayjs): string {
    return day.get("date") === 1
      ? day.format("MMM D")
      : day.get("date").toString();
  }

  public get week(): dayjs.Dayjs[] {
    return [0, 1, 2, 3, 4, 5, 6].map((i: number) =>
      dayjs(this.first_day_of_week).add(i, "day")
    );
  }

  public get assignment_info(): AssignmentInfo[][] {
    return this.week.map((_day) =>
      this.all_assignment_dates.filter((_info: AssignmentInfo) =>
        _info.date.isSame(_day, "day")
      )
    );
  }

  private show(_assignment: AssignmentInfo): string {
    const reduced_scoring_enabled = settings_store.getSetting(
      "pg{ansEvalDefaults}{enableReducedScoring}"
    );
    return reduced_scoring_enabled && reduced_scoring_enabled.value
      ? _assignment.type
      : _assignment.type === "reduced_scoring"
      ? "invisible"
      : _assignment.type;
  }
} // class ProblemSetMixin
