<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { CreateElement, VNode } from "vue";

import {
  BIconCalendar,
  BIconPeople,
  BIconInfoSquare,
  BIconBook,
  BIconListUl,
  BIconPencil,
  BIconBarChart,
  BIconArrowLeftRight,
  BIconGear,
} from "bootstrap-vue";
Vue.component("BIconCalendar", BIconCalendar);
Vue.component("BIconPeople", BIconPeople);
Vue.component("BIconInfoSquare", BIconInfoSquare);
Vue.component("BIconBook", BIconBook);
Vue.component("BIconListUl", BIconListUl);
Vue.component("BIconPencil", BIconPencil);
Vue.component("BIconBarChart", BIconBarChart);
Vue.component("BIconArrowLeftRight", BIconArrowLeftRight);
Vue.component("BIconGear", BIconGear);

@Component({ name: "ViewIcon" })
export default class ViewIcon extends Vue {
  @Prop() private icon!: string;
  @Prop() private scale!: number;
  @Prop() private variant!: string;

  private render(rend: CreateElement): VNode {
    return rend("b-icon-" + this.icon, {
      attrs: {
        scale: this.scale,
        variant: this.variant,
      },
    });
  }
}
</script>
