<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

// icons
import {
  BIconPlus,
  BIconPencil,
  BIconArrowClockwise,
  BIconTrash,
  BIconCheck,
  BIconTag,
  BIconFolder,
  BIconBullseye,
  BIconArrowUpDown,
} from "bootstrap-vue";
Vue.component("BIconPlus", BIconPlus);
Vue.component("BIconPencil", BIconPencil);
Vue.component("BIconArrowClockwise", BIconArrowClockwise);
Vue.component("BIconTrash", BIconTrash);
Vue.component("BIconCheck", BIconCheck);
Vue.component("BIconTag", BIconTag);
Vue.component("BIconFolder", BIconFolder);
Vue.component("BIconBullseye", BIconBullseye);
Vue.component("BIconArrowUpDown", BIconArrowUpDown);

import AnswerDecoration from "./AnswerDecoration.vue";

// eslint-disable-next-line @typescript-eslint/naming-convention

import "./mathjax-config";
import "mathjax-full/es5/tex-chtml.js";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
declare let MathJax: any;

console.log(MathJax); // eslint-disable-line no-console

import {
  renderProblem,
  fetchProblemTags,
  submitUserProblem,
} from "@/store/api";

import {
  ProblemViewOptions,
  LIB_PROB,
  SET_PROB,
  STUDENT_PROB,
  newRenderedProblem,
} from "@/common";

import {
  Problem,
  RenderedProblem,
  StringMap,
  AnswerType,
} from "@/store/models";

interface ADHash {
  [key: string]: AnswerDecoration;
}

interface AnswerHash {
  [key: string]: AnswerType;
}

@Component({
  name: "ProblemView", // name of the view
  components: { AnswerDecoration },
})
export default class ProblemView extends Vue {
  private rendered_problem: RenderedProblem = newRenderedProblem();
  private show_tags = false;
  private show_path = false;
  private tags: StringMap = {};
  private submitted: StringMap = {};
  private answer_decorations: ADHash = {};

  @Prop() private problem!: Problem;
  @Prop() private type!: string;
  @Prop() private user_id!: string;

  public mounted() {
    this.renderProblem({});
  }

  private get tags_loaded() {
    return Object.keys(this.tags).length > 0;
  }

  private async renderProblem(other_params: StringMap) {
    const problem = await renderProblem(
      Object.assign({}, this.problem, other_params)
    );
    this.rendered_problem = problem;
    Promise.resolve()
      .then(() => MathJax.typesetPromise())
      .catch((e) => console.log(e));
  }

  get prop(): ProblemViewOptions {
    switch (this.type) {
      case "library":
        return LIB_PROB;
      case "set":
        return SET_PROB;
      case "student":
        return STUDENT_PROB;
    }
    return STUDENT_PROB;
  }

  private addProblem(evt: Event): void {
    console.log(evt); // eslint-disable-line no-console
  }

  private randomize(): void {
    this.renderProblem({ problem_seed: Math.ceil(10000 * Math.random()) });
  }

  @Watch("problem")
  private problemChange(): void {
    this.renderProblem({});
  }

  @Watch("show_tags")
  private async showTagsChanged() {
    if (!this.tags_loaded) {
      // the tags object is empty
      this.tags = await fetchProblemTags(this.problem.source_file);
    }
  }

  private edit() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.$router.push({ name: "editor", params: { problem: this.problem } });
  }

  private parseAnswers() {
    return this.rendered_problem.flags.ANSWER_ENTRY_ORDER.reduce(
      (obj: StringMap, ans: string) => {
        const input = document.getElementById(ans) as HTMLInputElement;
        obj[ans] = input ? input.value : "";
        return obj;
      },
      {}
    ); // eslint-disable-line no-console
  }

  private buildAnswerDecorations() {
    if (
      this.rendered_problem &&
      this.rendered_problem.flags.ANSWER_ENTRY_ORDER
    ) {
      this.rendered_problem.flags.ANSWER_ENTRY_ORDER.forEach((_ans: string) => {
        const input = document.getElementById(_ans) as HTMLInputElement;
        if (input) {
          const wrapper = document.createElement("span");
          this.answer_decorations[_ans] = new AnswerDecoration({
            propsData: { type: "" },
          });
          this.answer_decorations[_ans].$mount();
          if (input.parentNode) {
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(this.answer_decorations[_ans].$el);
          }
        }
      });
    }
  }

  private updateAnswerDecorations() {
    const answers = (this.submitted.answers as unknown) as AnswerHash;
    Object.keys(answers).forEach((_ans: string) => {
      this.answer_decorations[_ans].$props.type =
        answers[_ans].score === 1 ? "correct" : "incorrect";
    });
  }

  private async check() {
    this.submitted = await submitUserProblem(
      Object.assign(
        ({
          answers: this.parseAnswers(),
          checkAnswers: true,
          submitAnswers: false,
        } as unknown) as StringMap,
        (this.problem as unknown) as StringMap
      )
    );
    this.updateAnswerDecorations();
    console.log(this.submitted); // eslint-disable-line no-console
  }

  private preview() {
    const ans = this.parseAnswers();
    console.log(ans); // eslint-disable-line no-console
  }
}
</script>

<template>
  <li class="problem p-2 rounded">
    <b-container>
      <b-row>
        <b-col cols="6">
          <b-row>
            <b-col v-if="prop.numbered" cols="2">
              <b-input-group size="sm">
                <span class="problem-id">{{
                  problem && problem.problem_id
                }}</span>
              </b-input-group>
            </b-col>
            <b-col v-if="prop.value" cols="4">
              <b-input-group size="sm">
                <template #prepend>
                  <b-input-group-text>Value:</b-input-group-text>
                </template>
                <b-input v-model="problem.value" type="number" />
              </b-input-group>
            </b-col>
            <b-col v-if="prop.attempts" cols="4">
              <b-input-group size="sm" prepend="Max. Att.:">
                <b-input v-model="problem.max_attempts" type="number" />
              </b-input-group>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="5">
          <b-btn-toolbar>
            <b-btn-group size="sm">
              <b-btn
                v-if="prop.add"
                variant="outline-dark"
                title="add problem"
                @click="$emit('add-problem', problem)"
              >
                <b-icon-plus />
              </b-btn>
              <b-btn
                v-if="prop.edit"
                variant="outline-dark"
                title="edit"
                @click="edit"
              >
                <b-icon-pencil />
              </b-btn>
              <b-btn
                v-if="prop.randomize"
                variant="outline-dark"
                title="randomize"
                @click="randomize"
              >
                <b-icon-arrow-clockwise />
              </b-btn>
              <b-btn
                v-if="prop.delete"
                variant="outline-dark"
                title="delete problem"
              >
                <b-icon-trash />
              </b-btn>
              <b-btn
                v-if="prop.mark_all"
                variant="outline-dark"
                title="Mark this problem correct for all assigned users."
                disabled
              >
                <b-icon-check />
              </b-btn>
              <b-btn
                v-if="prop.tags"
                :variant="show_tags ? 'success' : 'outline-dark'"
                title="show/hide tags"
                @click="show_tags = !show_tags"
              >
                <b-icon-tag />
              </b-btn>
              <b-btn
                v-if="prop.path"
                :variant="show_path ? 'success' : 'outline-dark'"
                title="show/hide path"
                @click="show_path = !show_path"
              >
                <b-icon-folder />
              </b-btn>
              <b-btn
                v-if="prop.target_set"
                variant="outline-dark"
                title="This problem is in the target set."
              >
                <b-icon-bullseye />
              </b-btn>
            </b-btn-group>
          </b-btn-toolbar>
        </b-col>
        <b-col cols="1">
          <b-btn-group v-if="prop.reorder" size="sm" class="float-right">
            <b-btn
              class="drag-handle border border-dark rounded p-2"
              variant="outline-dark"
            >
              <b-icon-arrow-up-down />
            </b-btn>
          </b-btn-group>
        </b-col>
      </b-row>
      <b-row v-if="show_path"> Path: {{ problem.source_file }} </b-row>
      <b-row v-if="show_tags && tags_loaded">
        <table class="table table-sm table-bordered">
          <tr>
            <td class="header">DBsubject:</td>
            <td>{{ tags.DBsubject }}</td>
            <td class="header">DBchapter:</td>
            <td>{{ tags.DBchapter }}</td>
            <td class="header">DBsection:</td>
            <td>{{ tags.DBsection }}</td>
          </tr>
          <tr>
            <td class="header">Author:</td>
            <td>{{ tags.Author }}</td>
            <td class="header">Institution:</td>
            <td>{{ tags.Institution }}</td>
            <td class="header">Date:</td>
            <td>{{ tags.Date }}</td>
          </tr>
          <tr>
            <td class="header">Level:</td>
            <td>{{ tags.Level }}</td>
            <td class="header">MLT:</td>
            <td>{{ tags.MLT }}</td>
            <td class="header">MLTleader:</td>
            <td>{{ tags.MLTleader }}</td>
          </tr>
          <tr>
            <td class="header">keywords:</td>
            <td colspan="5">{{ tags.keywords.join(", ") }}</td>
          </tr>
          <tr>
            <td class="header">Language:</td>
            <td>{{ tags.Language }}</td>
            <td class="header">Status:</td>
            <td>{{ tags.Status }}</td>
            <td class="header">isPlaceholder:</td>
            <td>{{ tags.isPlaceholder }}</td>
          </tr>
          <tr>
            <td class="header">MO:</td>
            <td>{{ tags.MO }}</td>
            <td class="header">lasttagline:</td>
            <td>{{ tags.lasttagline }}</td>
            <td class="header">static:</td>
            <td>{{ tags.static }}</td>
          </tr>
          <tr>
            <td class="header">modified:</td>
            <td>{{ tags.modified }}</td>
            <td class="header">resources:</td>
            <td colspan="3">{{ tags.resources.join(", ") }}</td>
          </tr>
          <tr>
            <td class="header" colspan="6">Textbook Info</td>
          </tr>
          <template v-for="textbook in tags.textinfo">
            <tr :key="'row1:' + textbook.TitleText">
              <td class="header">TitleText:</td>
              <td>{{ textbook.TitleText }}</td>
              <td class="header">AuthorText:</td>
              <td>{{ textbook.AuthorText }}</td>
              <td class="header">EditionText:</td>
              <td>{{ textbook.EditionText }}</td>
            </tr>
            <tr :key="'row2:' + textbook.TitleText">
              <td class="header">chapter:</td>
              <td>{{ textbook.chapter }}</td>
              <td class="header">section:</td>
              <td>{{ textbook.section }}</td>
              <td class="header">problems:</td>
              <td>{{ textbook.problems }}</td>
            </tr>
          </template>
        </table>
      </b-row>
      <b-row>
        <div v-if="rendered_problem.text == ''" class="text-center">
          <b-spinner variant="info" />
        </div>
        <div v-else class="problem-tag-container">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div id="problem-output" v-html="rendered_problem.text" />
        </div>
      </b-row>
      <b-row v-if="type === 'student'" class="pt-3">
        <b-col cols="4">
          <b-btn variant="primary" @click="preview">Preview My Answer</b-btn>
        </b-col>
        <b-col cols="4">
          <b-btn variant="primary" @click="check">Check My Answer</b-btn>
        </b-col>
      </b-row>
    </b-container>
  </li>
</template>

<style>
.correct {
  border: solid 2px green;
}
.incorrect {
  border: solid 2px red;
}
.header {
  font-weight: bold;
}
.problem {
  list-style: none;
  border: 1px black solid;
  width: 100%;
}
.problem-id {
  font-weight: bold;
  font-size: 120%;
  padding-right: 1ex;
}
</style>
