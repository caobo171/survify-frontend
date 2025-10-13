'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FormTypeNavigation } from "../../../_components/FormTypeNavigation"
import WarningChatBox from "../../../_components/WarningChatBox";
import { useFormById } from '@/hooks/form';
import { useParams } from 'next/navigation';
import Fetch from '@/lib/core/fetch/Fetch';
import LoadingAbsolute from '@/components/loading';
import { DataModel, RawDataModel, RawForm } from '@/store/types';
import { Helper } from '@/services/Helper';
import { useRouter } from 'next/navigation';
import { QUESTION_TYPE, Code, OPTIONS_DELAY_ENUM, ORDER_TYPE, PULSES_TOKEN } from '@/core/Constants';
import { FormInfoSection } from '../../../_components/FormInfoSection';
import { BasicModelBuilder } from './BasicModelBuilder'
import { Toast } from '@/services/Toast';
import { CreateOrderForm } from "@/components/form";
import { useMe, useMyBankInfo } from '@/hooks/user';
import { useMyDataModels, useUserDataModels } from '@/hooks/data.model';
import { ModelAdvanceBuilder, ModelAdvanceBuilderRef } from '@/app/(inapp)/data/builder/_components/ModelAdvanceBuilder';
import ACL from '@/services/ACL';
import Select from 'react-select';
import { AdvanceModelType, ModerateEffectNodeDataType, VariableNodeDataType } from '@/store/data.service.types';
import { useModelVariables } from '@/hooks/useModelVariables';
import { ModelSelectionComponent } from './ModelSelectionComponent';
import SmartPLSResult from '@/app/(inapp)/data.order/detail/[id]/_components/SmartPLSResult';
import SPSSResult from '@/app/(inapp)/data.order/detail/[id]/_components/SPSSResult';

interface ChatError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'note';
}


export default function BuildDataForm() {

    const params = useParams();
    const me = useMe();
    const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(params.id as string);
    const { register, handleSubmit, watch, setValue } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [reloadEvent, setReloadEvent] = useState(false);
    const router = useRouter();

    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(true);
    const [chatErrors, setChatErrors] = useState<ChatError[]>([]);

    const availableQuestions = dataForm?.form.loaddata || [];

    // CreateOrderForm state variables
    const { data: user } = useMe();
    const bankInfo = useMyBankInfo();
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [isShowErrorMessage, setIsShowErrorMessage] = useState<boolean>(false);
    const [delayValue, setDelayValue] = useState<number>(OPTIONS_DELAY_ENUM.NO_DELAY);
    const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('20:00');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [specificStartDate, setSpecificStartDate] = useState('');
    const [specificEndDate, setSpecificEndDate] = useState('');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>([]);

    const [isReadingAnalysisResult, setIsReadingAnalysisResult] = useState<boolean>(false);
    const modelsData = useUserDataModels(1, 200, dataForm?.form?.owner_id || '', {});

    const [selectedAdvanceModel, setSelectedAdvanceModel] = useState<RawDataModel | null>(null);
    const [advanceModelData, setAdvanceModelData] = useState<AdvanceModelType | null>(null);

    const {
        moderateVariables: currentModerateVariables,
        mediatorVariables: currentMediatorVariables,
        independentVariables: currentIndependentVariables,
        dependentVariables: currentDependentVariables,
    } = useModelVariables(advanceModelData);

    const [isCreatingNewModel, setIsCreatingNewModel] = useState<boolean>(false);
    const modelBuilderRef = useRef<ModelAdvanceBuilderRef>(null);

    const [numRequest, setNumRequest] = useState<number>(1);

    const [mappingQuestionToVariable, setMappingQuestionToVariable] = useState<{ [key: string]: string }>({});

    const [isShowingResult, setIsShowingResult] = useState<boolean>(false);


    const realMappingQuestionToVariable = useMemo(() => {

        let res: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(mappingQuestionToVariable)) {
            if (advanceModelData?.nodes.find((node) => node.id === value)) {
                res[key] = value;
            }
        }

        return res;
    }, [mappingQuestionToVariable, advanceModelData]);


    const missingMapVariables = useMemo(() => {
        let res: VariableNodeDataType[] = [];
        for (const [key, value] of Object.entries(advanceModelData?.nodes || [])) {

            if (value.data?.nodeType !== "variable") continue;

            let mappingQuestions = Object.values(mappingQuestionToVariable).filter((item) => item == value.id);
            if (mappingQuestions.length == 0) {
                res.push(value.data as VariableNodeDataType);
            }
        }
        return res;
    }, [mappingQuestionToVariable, advanceModelData]);

    // Auto-refresh ModelAdvanceBuilder only when switching between model methods or selecting different models
    useEffect(() => {
        if (modelBuilderRef.current) {
            console.log('Auto-refreshing model builder due to model method/selection change...');
            modelBuilderRef.current.refresh();
        }
    }, [isCreatingNewModel, selectedAdvanceModel?.id]);

    const onSubmit = async (data: any) => {
        // Handle form submission
        setIsSaved(false);
        setIsLoading(true);
        try {
            let dataModelId = selectedAdvanceModel?.id;

            // If we're in advance mode and creating a new model
            if (!selectedAdvanceModel && advanceModelData) {
                // First create the new model
                const createModelResponse = await Fetch.postWithAccessToken<{
                    code: number,
                    model: RawDataModel,
                    message: string,
                }>('/api/data.model/create', {
                    model: JSON.stringify(advanceModelData),
                    name: dataForm?.form?.name || 'Model mới'
                });

                if (createModelResponse.data.code === Code.SUCCESS) {
                    dataModelId = createModelResponse.data.model.id;
                    // Update the selected model state
                    setSelectedAdvanceModel(createModelResponse.data.model);
                } else {
                    throw new Error(createModelResponse.data.message || 'Tạo model thất bại');
                }
            }

            const res = await Fetch.postWithAccessToken<{ code: number, message: string, form: RawForm, data_model?: RawDataModel }>('/api/form/save.model', {
                id: dataForm?.form.id,
                ...data,
                advance_model: JSON.stringify(advanceModelData),
                data_model_id: dataModelId,
                mapping_question_to_variable: JSON.stringify(mappingQuestionToVariable),
            });

            if (res.data.form) {
                setIsCreatingNewModel(false);
                mutateForm();
                modelsData.mutate();
                Toast.success('Lưu model thành công');
            }



        } catch (error) {
            console.error(error);

            // @ts-ignore
            Toast.error(error.message || 'Lỗi khi lưu model');
        }

        setIsLoading(false);
        setIsSaved(true);
    };

    // Form submission handler for CreateOrderForm
    const onSubmitOrder = async () => {
        if (chatErrors.some(error => error.type === 'error') && !isShowErrorMessage) {
            setIsShowErrorMessage(true);
            return;
        }

        setIsLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/create.model.run', {
                form_id: dataForm?.form?.id,
                delay_type: delayValue,
                num_request: numRequest,
                schedule_enabled: scheduleEnabled ? 1 : 0,
                start_time: startTime,
                end_time: endTime,
                disabled_days: disabledDays.join(','),
                specific_start_date: specificStartDate,
                specific_end_date: specificEndDate,
                specific_daily_schedules: specificDailySchedules.map(e => `${e.date}_${e.startTime}_${e.endTime}_${e.enabled}`).join(','),
                is_reading_analysis_result: isReadingAnalysisResult ? 1 : 0,
            });

            if (response.data?.code == Code.SUCCESS) {
                Toast.success('Đã tạo yêu cầu điền form thành công!');
                router.push(`/`);

                const win = window as any;
                //@ts-ignore
                if (win.PulseSurvify?.surveyIgnored?.(PULSES_TOKEN)) {
                    console.log('User has ignored the survey');
                } else if (win.PulseSurvify?.surveyResponded?.(PULSES_TOKEN)) {
                    console.log('User has answered the survey');
                } else {
                    // You can call to show survey directly
                    win.PulseSurvify?.showSurvify?.(PULSES_TOKEN);
                }
            } else {
                Toast.error(response.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
                console.error('Form submission failed', response);
            }

            console.log("res", response);
            setIsLoading(false);
        } catch (err) {
            Toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
            console.error('Form submission failed', err);
            setIsLoading(false);
        }

        setSubmitDisabled(false);
    };


    const autoFillHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, message: string, form: RawForm }>('/api/form/rate.autofill', {
                id: dataForm?.form.id,
            });

            await mutateForm();

            // After mutating, update all form values
            if (res.data.form.loaddata) {
                res.data.form.loaddata.forEach((question) => {
                    if (question.type) {
                        setValue(`isMulti-${question.id}`, question.isMulti);
                        setValue(`totalans-${question.id}`, question.totalAnswer);
                        setValue(`type-${question.id}`, question.type);

                        question.answer?.forEach((answer: any) => {
                            if (answer.data) {
                                setValue(`answer_${answer.id}`, answer.count);
                            }
                        });
                    } else {
                        question.answer?.forEach((answer: any) => {
                            setValue(answer.id, answer.count);
                            if (answer.data) {
                                setValue(`custom-${answer.id}`, answer.data);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
    };


    const onHandleDataAnalysis = async () => {
        if (!numRequest || numRequest <= 0) {
            Toast.error('Please enter a valid number of requests');
            return;
        }

        setIsLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<{
                code: number,
                message?: string,
                form: RawForm
            }>('/api/form/analysis', {
                id: dataForm?.form?.id,
                data_model_id: selectedAdvanceModel?.id,
                num_request: numRequest,
            });

            if (response.data.code !== Code.SUCCESS) {
                setIsLoading(false);
                setSubmitDisabled(false);
                Toast.error(response.data.message || 'Failed to create analysis');
                return;
            }

            mutateForm();
            setIsShowingResult(true);

            Toast.success('Analysis completed successfully!');
        } catch (error) {
            console.error('Error creating analysis:', error);
            Toast.error('Failed to create analysis');
        } finally {
            setIsLoading(false);
            setSubmitDisabled(false);
        }
    };

    const syncFormHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await Fetch.postWithAccessToken('/api/form/sync.config', {
                id: dataForm?.form.id,
            });

            await mutateForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
    };

    const toggleChat = (): void => {
        setChatOpen(!chatOpen);
    };

    const removeChatError = (errorId: string): void => {
        setChatErrors(chatErrors.filter(error => error.id !== errorId));
    };

    const addChatError = (chatErrors: ChatError[], message: string, errorId: string, type: 'error' | 'warning' | 'note'): void => {
        // Check if error already exists
        if (chatErrors.some(error => error.id === errorId)) return;
        chatErrors.push({ id: errorId, message, type });
    };


    const validateInputs = (chatErrors: ChatError[]): void => {
        // Validation logic here
        // Similar to the original but using React state

        // Example validation:
        document.querySelectorAll(".js-answer.input[type='number']").forEach((input: Element) => {
            if (input instanceof HTMLInputElement) {
                const value = parseInt(input.value, 10);
                const errorId = `error-${input.id}`;

                if (value < 0 || value > 100) {
                    addChatError(chatErrors, `Invalid value (${value}). Please fill in percentage (%) is a natural number from 0-100`, errorId, "error");
                }
            }
        });

        // Add other validations as needed
        // Multi-choice validation
        document.querySelectorAll("[id^='isMulti-']").forEach((multiInput: Element) => {
            if (multiInput instanceof HTMLInputElement) {
                const questionId = multiInput.id.split('-')[1];
                const totalInput = document.getElementById(`totalans-${questionId}`);
                let sum = 0;

                if (multiInput.value === "1") { // Multi-choice question
                    document.querySelectorAll(`input[id^='answer_${questionId}']`).forEach((input: Element) => {
                        if (input instanceof HTMLInputElement) {
                            sum += parseInt(input.value, 10) || 0;
                        }
                    });

                    if (sum < 120) {
                        addChatError(chatErrors, `Multi-choice question. Need to fill in percentage (%) is a natural number from 0-100. And the total percentage should be greater than 120, to mix the best (currently: ${sum})`, `multi-error-${questionId}`, "error");
                    }
                }
            }
        });

        // "Other" option validation
        document.querySelectorAll(".js-answer-select").forEach((select: Element) => {
            if (select instanceof HTMLSelectElement) {
                const questionDom = select.closest(".js-question");
                const questionId = questionDom?.id?.replace("question-", "");

                let question = dataForm?.latest_form_questions?.find(q => q.id == questionId);
                if (select.value.toLowerCase().includes("other")) {
                    addChatError(chatErrors, `You selected "other - skip not fill". Please check again whether you have turned off mandatory fill in the question <b>${question?.question} - ${question?.description || ''}</b> on Google Form?`, `select-error-${select.id}`, question?.required ? "error" : "warning");
                }
            }
        });
    };

    const validateConfig = (chatErrors: ChatError[]): void => {

        if (!dataForm?.latest_form_questions) {
            return addChatError(chatErrors, `System cannot check config currently, please remember to share form with anyone who has link`, `00000`, "error");
        }

        const latest_form_questions = dataForm?.latest_form_questions || [];
        if (latest_form_questions.length !== dataForm?.form.loaddata?.length) {
            addChatError(chatErrors, `There is a difference between the current form data and the latest form data. Please check the latest form data`, `00000`, "error");
        }

        let min_length = Math.min(latest_form_questions.length, dataForm?.form.loaddata?.length || 0);
        for (let i = 0; i < min_length; i++) {
            const latest_question = latest_form_questions[i];
            const question = dataForm?.form.loaddata[i];


            if (question?.type != latest_question?.type) {
                console.log(question, latest_question);
                addChatError(chatErrors, `There is a difference between the current question and the latest question. Please check the latest question`, `00000`, "error");
                continue;
            }

            if (question.type == QUESTION_TYPE.FILE) {
                addChatError(chatErrors, `Not supported question type file ${question.question} - ${question.description || ''}`, `00000`, "error");
                continue;
            }

            if (Helper.isSelectType(question?.type)) {
                let latest_answers = latest_question.answer || [];
                let answers = question.answer || [];

                if (latest_answers.length !== answers.length) {
                    addChatError(chatErrors, `There is a difference between the current answer and the latest answer. Please check the latest answer`, `00000`, "error");
                    continue;
                }

                for (let j = 0; j < latest_answers.length; j++) {
                    const latest_answer = latest_answers[j];
                    const answer = answers[j];

                    if (latest_answer.data != answer.data) {
                        addChatError(chatErrors, `There is a difference between the current answer and the latest answer. Please check the latest answer`, `00000`, "error");
                        break;
                    }

                    if (latest_answer.go_to_section != answer.go_to_section) {
                        addChatError(chatErrors, `There is a difference between the current answer and the latest answer. Please check the latest answer`, `00000`, "error");
                        break;
                    }
                }
            }
        }

        const latest_form_sections = dataForm?.latest_form_sections || [];
        if (latest_form_sections.length !== dataForm?.form.sections?.length) {
            addChatError(chatErrors, `There is a difference between the current section and the latest section. Please check the latest section`, `00000`, "error");
        }

        const min_sections_length = Math.min(latest_form_sections.length, dataForm?.form.sections?.length || 0);

        for (let i = 0; i < min_sections_length; i++) {
            const latest_section = latest_form_sections[i];
            const section = dataForm?.form.sections[i];
            if (latest_section.next_section != section.next_section) {
                addChatError(chatErrors, `There is a difference between the current section and the latest section. Please check the latest section`, `00000`, "error");
                break;
            }
        }


        // Config validation logic
        if (dataForm?.config?.lang === null) {
            addChatError(chatErrors, `System cannot check config currently, please remember to turn off collect email and limit answer`, `00000`, "warning");
        } else {
            if (dataForm?.config?.isValidPublished === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Form has not been published. If it is an old form (before 2025), you can ignore this error.`, `00004`, "error");
            } else if (dataForm?.config?.isValidPublished === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> System cannot check config, please remember to publish Form`, `00004`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Must select "Do not Collect" in setting.`, `00001`, "error");
            } else if (dataForm?.config?.isValidCollectEmail === "null") {
                addChatError(chatErrors, `System cannot check config, please remember to turn off collect email`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidEditAnswer === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Must turn off "Allow editing responses" in setting.`, `00002`, "error");
            } else if (dataForm?.config?.isValidEditAnswer === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> System cannot check config, please remember to turn off "Allow editing responses" in setting`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidLimitRes === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Must turn off "Limit responses to one per person" in setting.`, `00003`, "error");
            } else if (dataForm?.config?.isValidLimitRes === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> System cannot check config, please remember to turn off "Limit responses to one per person" in setting`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "true" &&
                dataForm?.config?.isValidEditAnswer === "true" &&
                dataForm?.config?.isValidLimitRes === "true" &&
                dataForm?.config?.isValidPublished === "true") {
                addChatError(chatErrors, `Perfect! Google form setting OK. Please set model for this form and fill ratio for demographic.`, `00005`, "note");
            }
        }
    };

    // Function to handle select change
    const handleSelectChange = (selectId: string) => {
        const select = document.getElementById(selectId) as HTMLSelectElement;
        if (select) {
            const inputId = selectId.replace("select-", "custom-");
            const textarea = document.getElementById(inputId) as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.display = select.value === "custom (custom data)" ? "block" : "none";
            }
        }
    };


    useEffect(() => {
        if (dataForm?.form && dataForm?.form.advance_model_config?.data_model_id && modelsData?.data?.data_models) {
            const model = modelsData?.data?.data_models?.find((model) => model.id === dataForm?.form.advance_model_config?.data_model_id);
            if (model) {
                setSelectedAdvanceModel(model);
                setAdvanceModelData(model.data_model);
            }
        }
    }, [modelsData?.data?.data_models?.length, dataForm]);

    useEffect(() => {
        if (dataForm?.form && dataForm?.form.loaddata) {
            const validateAll = () => {
                let chatErrors: ChatError[] = [];
                validateInputs(chatErrors);
                validateConfig(chatErrors);
                chatErrors.sort((a, b) => {
                    if (a.type === "error" && b.type !== "error") {
                        return -1;
                    } else if (a.type !== "error" && b.type === "error") {
                        return 1;
                    }
                    return 0;
                });

                if (missingMapVariables.length > 0) {
                    chatErrors.push({
                        id: 'missing_map_variables',
                        message: 'Có các biến ' + missingMapVariables.map(e => e.label).join(', ') + ' chưa được ánh xạ với câu hỏi nào trên form',
                        type: 'error'
                    });
                }

                setChatErrors(chatErrors);
            }

            // Add event listeners for form validation
            const numberInputs = document.querySelectorAll(".js-answer.input[type='number']");
            const selects = document.querySelectorAll(".js-answer-select");

            const handleInputChange = () => {
                validateAll();
                setIsSaved(false);
            }

            numberInputs.forEach(input => {
                input.addEventListener('input', handleInputChange);
            });

            // Initialize textarea visibility
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                handleSelectChange(selectElement.id);
            });

            // Add event listeners for select changes
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                selectElement.addEventListener('change', () => {
                    handleSelectChange(selectElement.id);
                    validateAll();
                    setIsSaved(false);
                });
            });

            validateAll();

            // Cleanup event listeners
            return () => {
                numberInputs.forEach(input => {
                    input.removeEventListener('input', handleInputChange);
                });

                selects.forEach((select: Element) => {
                    const selectElement = select as HTMLSelectElement;
                    selectElement.removeEventListener('change', () => handleSelectChange(selectElement.id));
                });
            };
        }
    }, [dataForm, reloadEvent, missingMapVariables]);

    useEffect(() => {
        if (dataForm?.form && dataForm?.form.advance_model_config?.mapping_question_to_variable) {
            setMappingQuestionToVariable(dataForm?.form.advance_model_config?.mapping_question_to_variable)
        }
    }, [dataForm, reloadEvent]);



    if (isLoadingForm || !dataForm) {
        return (
            <LoadingAbsolute />
        );
    }


    return (
        <>
            <section className=" ">
                <div className=" " data-aos="fade-up">

                    {(isLoading) && <LoadingAbsolute />}
                    <div className="container mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-left text-gray-900">Fill in the form with model</h1>

                        <FormTypeNavigation formId={dataForm?.form?.id} type={'build'} />

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="space-y-4 text-xs text-gray-700">
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>If you don't know how to fill, try
                                        <button onClick={autoFillHandle} className="mx-1 px-3 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition inline-flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            auto suggest ratio
                                        </button>
                                        to get suggestions, only for reference.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Make sure to edit <b>Variable name, Scale, Number of variables, Direction of effect</b> to match your model</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Remove <b>session</b> or fill ratio to <b>meet all filters</b>.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p>
                                        If you don't know how to fill, try
                                        <button onClick={autoFillHandle} className="mx-1 px-3 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition inline-flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            auto suggest ratio
                                        </button>
                                        to get suggestions, only for reference.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p>
                                        If you have changed at Google Form, please
                                        <button onClick={syncFormHandle} className="mx-1 px-3 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition inline-flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            sync configuration
                                        </button>
                                        to update again
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p>Survify will commit to filling the form according to the ratio and all hypotheses in the model</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p>Video guide: <a target="_blank" href="https://www.youtube.com/watch?v=SpqLCXKGFGU" className="text-primary-600 font-medium hover:underline">Watch here</a></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto mb-2">
                        <FormInfoSection dataForm={dataForm} />
                    </div>

                    <div className="container mx-auto mb-2">
                        {/* Model Selection Component */}
                        <ModelSelectionComponent
                            modelsData={modelsData}
                            isCreatingNewModel={isCreatingNewModel}
                            setIsCreatingNewModel={setIsCreatingNewModel}
                            selectedAdvanceModel={selectedAdvanceModel}
                            setSelectedAdvanceModel={setSelectedAdvanceModel}
                            advanceModelData={advanceModelData}
                            setAdvanceModelData={setAdvanceModelData}
                            modelBuilderRef={modelBuilderRef}
                            realMappingQuestionToVariable={realMappingQuestionToVariable}
                            setMappingQuestionToVariable={setMappingQuestionToVariable}
                            availableQuestions={availableQuestions}
                        />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="text-left bg-gray-50 p-1 rounded-lg container mx-auto">
                        <div className="space-y-2">
                            {dataForm?.form.loaddata && dataForm?.form.loaddata.filter(e => {
                                return !realMappingQuestionToVariable[e.id]
                            }).map((question, questionIndex) => (
                                <div key={questionIndex} id={`question-${question.id}`} className="js-question p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="md:flex md:items-start gap-8">
                                        <div className="md:w-1/4 md:max-w-1/4 md:min-w-1/4 mb-1 md:mb-0 flex-shrink-0">
                                            <div className="w-full">
                                                {question.description ? (
                                                    <>
                                                        <label className="block font-semibold text-xs mb-1 text-gray-900 truncate">{question.question}</label>
                                                        <label className="block text-xs text-gray-500 truncate">{question.description}</label>
                                                    </>
                                                ) : (
                                                    <label className="block font-semibold text-xs text-gray-900">{question.question}</label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:w-3/4 md:max-w-3/4 md:min-w-3/4 flex-grow">
                                            {question.type ? (
                                                <>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                        <input type="hidden" {...register(`isMulti-${question.id}`)} defaultValue={question.isMulti} />
                                                        <input type="hidden" {...register(`totalans-${question.id}`)} defaultValue={question.totalAnswer} />
                                                        <input type="hidden" {...register(`type-${question.id}`)} defaultValue={question.type} />

                                                        {question.answer && question.answer.map((answer: any, answerId: any) => (
                                                            answer.data && (
                                                                <div key={answerId} className="relative">
                                                                    <label
                                                                        htmlFor={`answer_${answer.id}`}
                                                                        className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                                    >
                                                                        {answer.data}
                                                                    </label>
                                                                    <input

                                                                        type="number"
                                                                        min="0"
                                                                        step="any"
                                                                        id={`answer_${answer.id}`}
                                                                        {...register(`answer_${answer.id}`)}
                                                                        defaultValue={answer.count}
                                                                        className="js-answer block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-xs/6"
                                                                    />
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                question.answer && question.answer.map((answer: any, answerId: any) => (
                                                    <div key={answerId} className="relative w-full">
                                                        <label
                                                            htmlFor={`select-${answer.id}`}
                                                            className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                        >
                                                            Choose type of question

                                                            <span className="text-xs text-gray-500">
                                                                &nbsp; (If you choose "other-Skip" then you must "turn off required on Google Form")
                                                            </span>
                                                        </label>

                                                        <select
                                                            className="js-answer-select block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-xs/6"
                                                            id={`select-${answer.id}`}
                                                            {...register(`answer_${answer.id}`)}
                                                            defaultValue={answer.count}
                                                        >
                                                            {answer.options && answer.options.map((option: any, optionId: any) => (
                                                                <option key={optionId} value={option}>{option}</option>
                                                            ))}
                                                        </select>

                                                        <textarea
                                                            className="mt-3 w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 text-xs hidden custom-input"
                                                            id={`custom-${answer.id}`}
                                                            {...register(`custom-${answer.id}`)}
                                                            defaultValue={answer.data}
                                                            rows={4}
                                                            placeholder="Nhập mỗi dòng 1 câu trả lời (ấn enter để xuống dòng). Không để dòng trống. Tool sẽ điền lặp lại ngẫu nhiên nếu số lượng không đủ."
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save model and continue to select sample size
                            </button>



                            {isSaved && !chatErrors.some(error => error.type === 'error') && (
                                <div className="animate-fade-in bg-green-50 border-l-4 border-green-600 p-6 mb-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-green-800 font-semibold text-lg">Saved data successfully</span>
                                    </div>


                                    {!isShowingResult ? (
                                        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Number of samples to create
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    value={numRequest}
                                                    onChange={(e) => setNumRequest(parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nhập số lượng mẫu..."
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={onHandleDataAnalysis}
                                                disabled={numRequest <= 0}
                                                className={`w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                                    ${numRequest <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                                Check result data
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <CreateOrderForm
                                                orderType={ORDER_TYPE.DATA_MODEL}
                                                disabledDays={disabledDays}
                                                scheduleEnabled={scheduleEnabled}
                                                startTime={startTime}
                                                endTime={endTime}
                                                userCredit={user?.credit || 0}
                                                numRequest={numRequest}
                                                delayType={delayValue}
                                                formId={dataForm?.form?.id}
                                                formName={dataForm?.form?.name}
                                                bankInfo={bankInfo}
                                                showBackButton={false}
                                                numModerateVariables={currentModerateVariables.length}
                                                numMediatorVariables={currentMediatorVariables.length}
                                                numIndependentVariables={currentIndependentVariables.length}
                                                numDependentVariables={currentDependentVariables.length}
                                                isReadingAnalysisResult={isReadingAnalysisResult}
                                                onIsReadingAnalysisResultChange={(value) => setIsReadingAnalysisResult(value)}
                                                specificStartDate={specificStartDate}
                                                specificEndDate={specificEndDate}
                                                specificDailySchedules={specificDailySchedules}
                                                onSpecificStartDateChange={(value) => setSpecificStartDate(value)}
                                                onSpecificEndDateChange={(value) => setSpecificEndDate(value)}
                                                onSpecificDailySchedulesChange={(value) => setSpecificDailySchedules(value)}

                                                onNumRequestChange={(value) => {
                                                    setNumRequest(value);
                                                }}
                                                onDelayTypeChange={(value) => {
                                                    setDelayValue(value);
                                                }}
                                                onScheduleEnabledChange={(value) => {
                                                    setScheduleEnabled(value);
                                                }}
                                                onStartTimeChange={(value) => {
                                                    setStartTime(value);
                                                }}
                                                onEndTimeChange={(value) => {
                                                    setEndTime(value);
                                                }}
                                                onDisabledDaysChange={(value) => {
                                                    setDisabledDays(value);
                                                }}
                                                className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 max-w-2xl"
                                            />
                                            <button
                                                type="submit"
                                                onClick={() => {
                                                    onSubmitOrder();
                                                }}
                                                className={`w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                                ${(user?.credit || 0) < numRequest || submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={(user?.credit || 0) < numRequest || submitDisabled}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {isShowErrorMessage ? 'Continue to fill form' : 'Start to fill form'}
                                            </button>


                                            <div className="w-full mt-4 flex items-center justify-center">
                                                {isShowErrorMessage && chatErrors.some(error => error.type === 'error') && (
                                                    <div className="w-full max-w-md text-red-800 bg-red-50 px-5 py-4 rounded-lg border border-red-200 shadow flex flex-col items-center animate-shake text-center" role="alert">
                                                        <div className="flex items-center mb-2">
                                                            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            <span className="text-base font-medium">Please check and fix the following errors:</span>
                                                        </div>
                                                        <ul className="list-disc list-inside text-sm text-left pl-5 mb-3">
                                                            {chatErrors.filter(error => error.type === 'error').map((error, index) => (
                                                                <li key={index} dangerouslySetInnerHTML={{ __html: error.message }}></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full mt-4 flex justify-center items-center">

                                                {isSaved && chatErrors.some(error => error.type === 'error') && (
                                                    <div className="w-full max-w-md mt-4 text-red-800 bg-red-50 px-5 py-4 rounded-lg border border-red-200 shadow flex flex-col items-center animate-shake" role="alert">
                                                        <div className="flex items-center mb-2">
                                                            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            <span className="text-base font-medium">Please check and fix the following errors:</span>
                                                        </div>
                                                        <ul className="list-disc list-inside text-sm text-left pl-5 mb-3">
                                                            {chatErrors.filter(error => error.type === 'error').map((error, index) => (
                                                                <li key={index} dangerouslySetInnerHTML={{ __html: error.message }}></li>
                                                            ))}
                                                        </ul>
                                                        <button
                                                            onClick={() => onSubmitOrder()}
                                                            className="inline-flex items-center px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                                        >
                                                            Continue to fill form
                                                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                        </>

                                    )}


                                </div>
                            )}

                        </div>
                    </form>


                    {
                        (isShowingResult) && (
                            <>

                                {
                                    dataForm?.form?.temp_data?.smartPLS ? (
                                        <SmartPLSResult
                                            data={dataForm?.form?.temp_data?.smartPLS}
                                            title="Kết quả phân tích SmartPLS"
                                            className="mb-8"
                                            questions={dataForm.form.loaddata}
                                            mappingQuestionToVariable={realMappingQuestionToVariable}
                                            model={advanceModelData}
                                        />
                                    ) : null
                                }
                                {/* SPSS Analysis Results */}
                                {
                                    (dataForm?.form?.temp_data?.basic_analysis || dataForm?.form?.temp_data?.linear_regression_analysis) ? (
                                        <SPSSResult
                                            basicAnalysis={dataForm?.form?.temp_data?.basic_analysis}
                                            linearRegressionAnalysis={dataForm?.form?.temp_data?.linear_regression_analysis}
                                            title="Kết quả phân tích SPSS"
                                            className="mb-8"
                                            questions={dataForm.form.loaddata}
                                            mappingQuestionToVariable={realMappingQuestionToVariable}
                                            model={advanceModelData}
                                        />
                                    ) : null
                                }


                                {/* SmartPLS Results */}
                            </>
                        )
                    }
                </div>
            </section>

            <WarningChatBox
                chatOpen={chatOpen}
                chatErrors={chatErrors}
                toggleChat={toggleChat}
                removeChatError={removeChatError}
            />
        </>
    );
}