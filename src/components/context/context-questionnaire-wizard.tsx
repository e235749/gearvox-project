"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { OptionChip } from "@/components/context/option-chip";
import {
  CONTEXT_QUESTIONNAIRE_INTRO,
  CONTEXT_QUESTIONNAIRE_STEPS,
  OTHER_OPTION,
} from "@/constants/context-options";
import { saveContextQuestionnaire } from "@/lib/context/actions";
import { getOptionsForStep } from "@/lib/context/format-context-summary";
import {
  EMPTY_CONTEXT_QUESTIONNAIRE,
  type ContextQuestionnaireInput,
} from "@/lib/context/validation";

interface ContextQuestionnaireWizardProps {
  initialValues?: ContextQuestionnaireInput;
  showIntro?: boolean;
  cancelHref?: string;
}

type WizardPhase = "intro" | "question" | "summary";

export function ContextQuestionnaireWizard({
  initialValues = EMPTY_CONTEXT_QUESTIONNAIRE,
  showIntro = true,
  cancelHref = "/profile",
}: ContextQuestionnaireWizardProps) {
  const router = useRouter();
  const [values, setValues] = useState<ContextQuestionnaireInput>(initialValues);
  const [phase, setPhase] = useState<WizardPhase>(showIntro ? "intro" : "question");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const currentStep = CONTEXT_QUESTIONNAIRE_STEPS[stepIndex];
  const options = useMemo(
    () => getOptionsForStep(currentStep.key),
    [currentStep.key],
  );

  function updateValues(patch: Partial<ContextQuestionnaireInput>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function handleSingleSelect(
    field:
      | "experienceYears"
      | "annualFrequency"
      | "transport"
      | "primarySeason"
      | "stayDuration"
      | "primaryPurpose",
    option: string,
  ) {
    updateValues({ [field]: option });
  }

  function handleMultiToggle(
    field: "companions" | "gearTags",
    option: string,
    maxSelect: number,
  ) {
    setValues((current) => {
      const currentValues = current[field];
      if (currentValues.includes(option)) {
        const nextValues = currentValues.filter((value) => value !== option);
        const patch: Partial<ContextQuestionnaireInput> = { [field]: nextValues };
        if (option === OTHER_OPTION) {
          patch[field === "companions" ? "companionOther" : "gearTagOther"] = "";
        }
        return { ...current, ...patch };
      }
      if (currentValues.length >= maxSelect) {
        return current;
      }
      return { ...current, [field]: [...currentValues, option] };
    });
  }

  function goNext() {
    setError(null);
    if (stepIndex < CONTEXT_QUESTIONNAIRE_STEPS.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }
    setPhase("summary");
  }

  function goBack() {
    setError(null);
    if (phase === "summary") {
      setPhase("question");
      return;
    }
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
      return;
    }
    if (showIntro) {
      setPhase("intro");
    }
  }

  async function handleSubmit() {
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("experience_years", values.experienceYears);
      formData.set("annual_frequency", values.annualFrequency);
      values.companions.forEach((value) => formData.append("companions", value));
      formData.set("companion_other", values.companionOther);
      formData.set("transport", values.transport);
      formData.set("transport_other", values.transportOther);
      formData.set("primary_season", values.primarySeason);
      formData.set("stay_duration", values.stayDuration);
      formData.set("primary_purpose", values.primaryPurpose);
      formData.set("primary_purpose_other", values.primaryPurposeOther);
      values.gearTags.forEach((value) => formData.append("gear_tags", value));
      formData.set("gear_tag_other", values.gearTagOther);

      const result = await saveContextQuestionnaire(null, formData);

      if (!result.success) {
        setError(result.error ?? "保存に失敗しました。");
        return;
      }

      router.push("/profile");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  function renderQuestionBody() {
    switch (currentStep.key) {
      case "experience_years":
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={values.experienceYears === option}
                onClick={() => handleSingleSelect("experienceYears", option)}
              />
            ))}
          </div>
        );
      case "annual_frequency":
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={values.annualFrequency === option}
                onClick={() => handleSingleSelect("annualFrequency", option)}
              />
            ))}
          </div>
        );
      case "companions":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={values.companions.includes(option)}
                  disabled={
                    !values.companions.includes(option) &&
                    values.companions.length >= (currentStep.maxSelect ?? 2)
                  }
                  onClick={() =>
                    handleMultiToggle("companions", option, currentStep.maxSelect ?? 2)
                  }
                />
              ))}
            </div>
            {values.companions.includes(OTHER_OPTION) ? (
              <input
                type="text"
                value={values.companionOther}
                onChange={(event) =>
                  updateValues({ companionOther: event.target.value })
                }
                maxLength={50}
                placeholder="その他の内容を入力"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
            ) : null}
          </div>
        );
      case "transport":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={values.transport === option}
                  onClick={() => handleSingleSelect("transport", option)}
                />
              ))}
            </div>
            {values.transport === OTHER_OPTION ? (
              <input
                type="text"
                value={values.transportOther}
                onChange={(event) =>
                  updateValues({ transportOther: event.target.value })
                }
                maxLength={50}
                placeholder="その他の内容を入力"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
            ) : null}
          </div>
        );
      case "primary_season":
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={values.primarySeason === option}
                onClick={() => handleSingleSelect("primarySeason", option)}
              />
            ))}
          </div>
        );
      case "stay_duration":
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={values.stayDuration === option}
                onClick={() => handleSingleSelect("stayDuration", option)}
              />
            ))}
          </div>
        );
      case "primary_purpose":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={values.primaryPurpose === option}
                  onClick={() => handleSingleSelect("primaryPurpose", option)}
                />
              ))}
            </div>
            {values.primaryPurpose === OTHER_OPTION ? (
              <input
                type="text"
                value={values.primaryPurposeOther}
                onChange={(event) =>
                  updateValues({ primaryPurposeOther: event.target.value })
                }
                maxLength={50}
                placeholder="その他の内容を入力"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
            ) : null}
          </div>
        );
      case "gear_tags":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={values.gearTags.includes(option)}
                  disabled={
                    !values.gearTags.includes(option) &&
                    values.gearTags.length >= (currentStep.maxSelect ?? 3)
                  }
                  onClick={() =>
                    handleMultiToggle("gearTags", option, currentStep.maxSelect ?? 3)
                  }
                />
              ))}
            </div>
            {values.gearTags.includes(OTHER_OPTION) ? (
              <input
                type="text"
                value={values.gearTagOther}
                onChange={(event) =>
                  updateValues({ gearTagOther: event.target.value })
                }
                maxLength={50}
                placeholder="その他の内容を入力"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
            ) : null}
          </div>
        );
      default:
        return null;
    }
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <h2 className="text-lg font-semibold">{CONTEXT_QUESTIONNAIRE_INTRO.title}</h2>
          <p className="leading-relaxed text-muted">
            {CONTEXT_QUESTIONNAIRE_INTRO.description}
          </p>
          <p className="text-xs text-muted">{CONTEXT_QUESTIONNAIRE_INTRO.duration}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase("question")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            アンケートを始める
          </button>
          <Link
            href={cancelHref}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent/50 hover:text-accent"
          >
            あとで
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "summary") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">回答内容の確認</h2>
          <p className="text-sm text-muted">内容を確認して保存してください。</p>
        </div>
        {error ? <AuthAlert message={error} /> : null}
        <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <div>
            <dt className="text-muted">経験年数</dt>
            <dd>{values.experienceYears || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">年間回数</dt>
            <dd>{values.annualFrequency || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">同行者・規模</dt>
            <dd>
              {values.companions
                .map((value) =>
                  value === OTHER_OPTION ? values.companionOther || OTHER_OPTION : value,
                )
                .join("、") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">移動手段</dt>
            <dd>
              {values.transport === OTHER_OPTION
                ? values.transportOther || OTHER_OPTION
                : values.transport || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">よく行く季節</dt>
            <dd>{values.primarySeason || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">滞在スタイル</dt>
            <dd>{values.stayDuration || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">キャンプの目的</dt>
            <dd>
              {values.primaryPurpose === OTHER_OPTION
                ? values.primaryPurposeOther || OTHER_OPTION
                : values.primaryPurpose || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">ギアの重視点</dt>
            <dd>
              {values.gearTags
                .map((value) =>
                  value === OTHER_OPTION ? values.gearTagOther || OTHER_OPTION : value,
                )
                .join("、") || "—"}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent/50 hover:text-accent"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-muted">
          {stepIndex + 1} / {CONTEXT_QUESTIONNAIRE_STEPS.length}
        </p>
        <h2 className="text-lg font-semibold">{currentStep.label}</h2>
        <p className="text-sm text-muted">{currentStep.description}</p>
        {"hint" in currentStep && currentStep.hint ? (
          <p className="text-xs text-muted">{currentStep.hint}</p>
        ) : null}
      </div>

      {renderQuestionBody()}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          {stepIndex === CONTEXT_QUESTIONNAIRE_STEPS.length - 1 ? "確認へ" : "次へ"}
        </button>
        <button
          type="button"
          onClick={goBack}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent/50 hover:text-accent"
        >
          戻る
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent/50 hover:text-accent"
        >
          あとで
        </Link>
      </div>
    </div>
  );
}
