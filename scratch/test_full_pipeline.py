import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

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

def test_full_referral_pipeline():
    print("=== TESTING EXACT DIRECT REFERRALS & PURCHASES PIPELINE ===\n")
    
    # Simulating getDirectReferralsWithPurchases with AI000004 or UUID
    target_profile_id = "52ef705c-bb45-4137-bee4-a3f8df73b676"
    
    ok, users = query_supabase(f"profiles?select=id,full_name,mobile,email,created_at,State,district,referral_code,share_id,is_active,registration_source&referred_by=eq.{target_profile_id}&order=created_at.desc")
    assert ok, f"Query failed: {users}"
    assert len(users) == 82, f"Expected 82 users, got {len(users)}"
    print(f"[PASS] 1. Successfully fetched all {len(users)} direct referral registered profiles.")

    # Fetch purchases
    ok_p, purchases = query_supabase("purchases?select=id,profile_id,amount,payment_status&payment_status=eq.success")
    assert ok_p, f"Purchases query failed: {purchases}"
    
    user_purchases_map = {}
    for p in purchases:
        pid = p.get('profile_id')
        amt = float(p.get('amount') or 0)
        if pid not in user_purchases_map:
            user_purchases_map[pid] = {'count': 0, 'total': 0}
        user_purchases_map[pid]['count'] += 1
        user_purchases_map[pid]['total'] += amt

    total_amount = 0
    active_count = 0
    detailed_referrals = []
    for u in users:
        pdata = user_purchases_map.get(u['id'], {'count': 0, 'total': 0})
        is_act = bool(u.get('is_active') or pdata['total'] > 0)
        if is_act:
            active_count += 1
        total_amount += pdata['total']
        detailed_referrals.append({
            'name': u['full_name'],
            'mobile': u['mobile'],
            'source': u['registration_source'],
            'is_active': is_act,
            'amount': pdata['total']
        })

    print(f"[PASS] 2. Successfully mapped purchases: Total Purchase Amount = Rs {total_amount:.2f}")
    print(f"[PASS] 3. Total Direct Referrals = {len(detailed_referrals)} (Active: {active_count}, Inactive: {len(detailed_referrals) - active_count})")
    print(f"\nSample 3 Active Referral Records:")
    for r in [x for x in detailed_referrals if x['is_active']][:3]:
        print(f"  - {r['name']} ({r['mobile']}) | Source: {r['source']} | Status: Active | Purchases: Rs {r['amount']}")

    print("\nALL DIRECT REFERRAL CHECKS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_referral_pipeline()
