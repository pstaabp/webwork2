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
  newProblemTags,
} from "@/common";

import {
  Problem,
  RenderedProblem,
  AnswerType,
  Dictionary,
  ProblemTags,
} from "@/store/models";

import ProblemTagsView from "./ProblemTagsView.vue";

@Component({
  name: "ProblemView", // name of the view
  components: { AnswerDecoration, ProblemTagsView },
})
export default class ProblemView extends Vue {
  private rendered_problem: RenderedProblem = newRenderedProblem();
  private show_tags = false;
  private show_path = false;
  private tags: ProblemTags = newProblemTags();
  private submitted: RenderedProblem = newRenderedProblem();
  private answer_decorations: Dictionary<AnswerDecoration> = {};

  @Prop() private problem!: Problem;
  @Prop() private type!: string;
  @Prop() private user_id!: string;
  @Prop() private problem_id!: number;

  public mounted() {
    this.renderProblem({});
  }

  private get tags_loaded() {
    return Object.keys(this.tags).length > 0;
  }

  private async renderProblem(other_params: Dictionary<string | number>) {
    const problem = await renderProblem(
      Object.assign({}, this.problem, other_params)
    );
    this.rendered_problem = problem;
    Promise.resolve()
      .then(() => {
        MathJax.typesetPromise();
        this.buildAnswerDecorations();
      })
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

  get is_open() {
    return true;
  }

  private addProblem(evt: Event): void {
    console.log(evt); // eslint-disable-line no-console
  }

  private randomize(): void {
    this.renderProblem({ problem_seed: Math.ceil(10000 * Math.random()) });
  }

  @Watch("problem.source_file")
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

  @Watch("problem_id")
  private problemIDchanged() {
    this.renderProblem({});
  }

  private edit() {
    console.log(this.problem); // eslint-disable-line no-console
    this.$router.push({
      name: "editor",
      params: { source_file: this.problem.source_file },
    });
  }

  private parseAnswers() {
    return this.rendered_problem.flags.ANSWER_ENTRY_ORDER.reduce(
      (obj: Dictionary<string | number>, ans: string) => {
        const input = document.getElementById(ans) as HTMLInputElement;
        obj[ans] = input ? input.value : "";
        return obj;
      },
      {}
    ); // eslint-disable-line no-console
  }

  private buildAnswerDecorations() {
    if ( this.type === 'student' &&
      this.rendered_problem &&
      this.rendered_problem.flags.ANSWER_ENTRY_ORDER
    ) {
      this.rendered_problem.flags.ANSWER_ENTRY_ORDER.forEach((_ans: string) => {
        const input = document.getElementById(_ans) as HTMLInputElement;
        if (input) {
          const wrapper = document.createElement("span");
          this.answer_decorations[_ans] = new AnswerDecoration({
            propsData: { type: "", label: _ans },
          });
          this.answer_decorations[_ans].$mount();
          this.answer_decorations[_ans].$on("preview", (label: string) =>
            this.preview(label)
          );

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
    const answers = (this.submitted.answers as unknown) as Dictionary<
      AnswerType
    >;
    Object.keys(answers).forEach((_ans: string) => {
      this.answer_decorations[_ans].$props.type =
        answers[_ans].score === 1 ? "correct" : "incorrect";
      this.answer_decorations[_ans].$props.answer = answers[_ans];
    });
  }

  private async submit(submit_answer: boolean) {
    this.submitted = await submitUserProblem(
      Object.assign(
        ({
          answers: this.parseAnswers(),
          checkAnswers: !submit_answer,
          submitAnswers: submit_answer,
        } as unknown) as Dictionary<string>,
        (this.problem as unknown) as Dictionary<string>
      )
    );
    this.updateAnswerDecorations();
    if (submit_answer) {
      this.$emit("update-sets");
    }
  }

  private async preview(label: string) {
    this.submitted = await submitUserProblem(
      Object.assign(
        ({
          answers: this.parseAnswers(),
          checkAnswers: false,
          submitAnswers: false,
        } as unknown) as Dictionary<string>,
        (this.problem as unknown) as Dictionary<string>
      )
    );
    this.answer_decorations[label].setPreviewString(
      this.submitted.answers[label].preview_latex_string
    );
    Promise.resolve()
      .then(() => {
        MathJax.typesetPromise();
        console.log("in typeset"); // eslint-disable-line no-console
      })
      .catch((e) => console.log(e));
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
        <problem-tags-view :problem_tags="problem_tags" />
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
        <b-col v-if="!is_open" cols="4">
          <b-btn variant="primary" @click="submit(false)">Check Answer</b-btn>
        </b-col>
        <b-col v-if="is_open" cols="4">
          <b-btn variant="primary" @click="submit(true)">Submit Answer</b-btn>
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
