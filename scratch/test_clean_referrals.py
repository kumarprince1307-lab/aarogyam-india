import urllib.request
import json

SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"

def query_supabase(path):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return True, data
    except Exception as e:
        return False, str(e)

target_profile_id = "52ef705c-bb45-4137-bee4-a3f8df73b676"
ok, users = query_supabase(f"profiles?select=id,full_name,mobile,email,created_at,State,district,referral_code,share_id,is_active,registration_source&referred_by=eq.{target_profile_id}&order=created_at.desc")

print("1. Referred Profiles Query Result:")
print(f"Success: {ok}, Count: {len(users) if ok else users}")

# Fetch purchases
ok2, purchases = query_supabase("purchases?select=id,profile_id,amount,payment_status&payment_status=eq.success")
print(f"Purchases count: {len(purchases) if ok2 else purchases}")

user_purchases_map = {}
total_purchase_amt = 0
for p in purchases:
    pid = p.get('profile_id')
    amt = float(p.get('amount') or 0)
    total_purchase_amt += amt
    if pid not in user_purchases_map:
        user_purchases_map[pid] = 0
    user_purchases_map[pid] += amt

paid_referrals = 0
for u in users:
    uid = u['id']
    pur_amt = user_purchases_map.get(uid, 0)
    u['totalPurchasedAmount'] = pur_amt
    if pur_amt > 0 or u.get('is_active'):
        paid_referrals += 1

print(f"Total Referrals: {len(users)}")
print(f"Paid / Active Referrals: {paid_referrals}")
print(f"Sample 5 Referrals:")
for u in users[:5]:
    print(f"- {u['full_name']} | 📞 {u['mobile']} | Source: {u['registration_source']} | Status: {'Active' if u['totalPurchasedAmount'] > 0 or u.get('is_active') else 'Inactive'} | Spent: ₹{u['totalPurchasedAmount']}")
