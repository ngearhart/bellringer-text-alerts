<template>
  <base-layout>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8">
        <v-card title="Sign Up for Text Alerts" style="overflow: initial; z-index: initial">
          <v-form @submit.prevent="signUp" ref="signupForm">
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <MazPhoneNumberInput
                      v-model="phone"
                      show-code-on-list
                      color="info"
                      :preferred-countries="['US']"
                      :disabled="loading"
                      @update="phoneError = false; phoneResult = $event"
                      :error="phoneError"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select
                      v-model="interval"
                      :disabled="loading"
                      label="Update Interval"
                      :items="intervals"
                      :rules="intervalRules"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-checkbox
                      :disabled="loading || signedUp"
                      :rules="checkboxRules"
                      v-model="checked"
                      :persistent-hint="signedUp"
                      :hint="signedUp ? 'To disagree with the terms and conditions, you must unsubscribe.' : ''"
                    >
                      <template v-slot:label>
                        <v-dialog
                          v-model="termsDialog"
                          width="auto"
                          persistent
                        >
                          <template v-slot:activator="{ props }">
                            I agree to the&nbsp;<a href="#" v-bind="props">terms and conditions ❐</a>
                          </template>
                          <v-card>
                            <v-card-title>Terms and Conditions</v-card-title>
                            <v-card-text>
                              <v-container>
                                <ol>
                                  <li>
                                    Noah Gearhart is personally providing this service "AS-IS" and makes no guarantees for uptime, service level agreement, or accuracy. Use at your own risk.
                                  </li>
                                  <li>
                                    Noah Gearhart personally funds this project, so your service may be terminated at any time for any reason .
                                  </li>
                                  <li>
                                    You can cancel the SMS service at any time. Just text "STOP" to the number. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, just sign up as you did the first time and we will start sending SMS messages to you again.
                                  </li>
                                  <li>
                                    If you are experiencing issues with the messaging program you can reply with the keyword HELP for more assistance, or you can get help directly by emailing us at bellringer-text-alerts@noahgearhart.com.
                                  </li>
                                  <li>
                                    Carriers are not liable for delayed or undelivered messages.
                                  </li>
                                  <li>
                                    As always, message and data rates may apply for any messages sent to you from us and to us from you. You will receive messages according to the frequency that you choose. If you have any questions about your text plan or data plan, it is best to contact your wireless provider.
                                  </li>
                                  <li>
                                    If you have any questions regarding privacy, please read <router-link to="/privacy-policy">our privacy policy</router-link>.
                                  </li>
                                </ol>
                              </v-container>
                            </v-card-text>
                            <v-card-actions>
                              <v-btn color="primary" block @click="termsDialog = false">Close</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions style="display: flex; justify-content: center;">
              <v-btn v-if="signedUp" class="mt-2" :disabled="loading" :loading="loading" @click="unsubscribe">
                Unsubscribe
              </v-btn>
              <v-btn type="submit" class="mt-2" :disabled="loading" :loading="loading">
                {{ signedUp ? 'Save Changes' : 'Sign Up' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
      
    </v-row>
  </base-layout>
</template>

<script lang="ts" setup>
import BaseLayout from '@/components/BaseLayout.vue'
import { onMounted, ref } from 'vue';
import { Result } from 'maz-ui/components/MazPhoneNumberInput'
import { reactive } from 'vue';
import { getCurrentUser, useDatabaseObject } from 'vuefire'
import { ref as dbRef, getDatabase, set, remove } from 'firebase/database'
import { watch } from 'vue';
import { computed } from 'vue';


type TextAlertUser = {
  phone: string
  interval: number,
  displayName: string,
  email: string
}

const intervals = reactive([
  {
    "title": "Every minute",
    "value": 1
  },
  {
    "title": "Every 5 minutes",
    "value": 5
  },
  {
    "title": "Every 15 minutes",
    "value": 15
  },
  {
    "title": "Every hour",
    "value": 60
  },
  {
    "title": "Every 4 hours",
    "value": 60 * 4
  },
  {
    "title": "Every day",
    "value": 60 * 24
  },
])

const intervalRules = [
  (value: string) => {
    if (value) return true

    return 'Please choose an interval'
  },
]

const checkboxRules = [
  (value: boolean) => {
    if (value) return true

    return 'You must agree to the terms and conditions'
  },
]


const termsDialog = ref(false)
const loading = ref(false)
const signupForm = ref<{validate: () => Promise<{valid: boolean}>}| null>(null)
const interval = ref<number | null>(null)
const phone = ref("")
const phoneResult = ref<Result>()
const phoneError = ref(false);

const signUp = async() => {
  const result = await signupForm.value?.validate()
  if (result?.valid && phoneResult.value?.isValid) {
    loading.value = true

    const newItem: TextAlertUser = {
      phone: phone.value,
      interval: interval.value || 1,
      displayName: displayName.value,
      email: email.value
    }
    set(currentDataSource.value, newItem)

    loading.value = false
  } else if (!phoneResult.value?.isValid) {
    phoneError.value = true
  }
}

const uid = ref('')
const displayName = ref('')
const email = ref('')
const signedUp = ref(false)
const checked = ref(false)

// Load existing database
const currentDataSource = computed(() => dbRef(getDatabase(), 'users/' + uid.value))
const currentData = useDatabaseObject<TextAlertUser | null>(currentDataSource)

watch(currentData, async(newData, oldData) => {
  if (newData) {
    signedUp.value = true
    phone.value = currentData.value?.phone || ''
    interval.value = currentData.value?.interval || 1
    checked.value = true
  } else {
    signedUp.value = false
    phone.value = ''
    interval.value = null
    checked.value = false
  }
})

onMounted(async () => {
  const currentUser = await getCurrentUser();
  uid.value = currentUser?.uid || '';
  email.value = currentUser?.email || '';
  displayName.value = currentUser?.displayName || '';
});

const unsubscribe = () => {
  remove(currentDataSource.value)
}

</script>
