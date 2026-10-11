import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def calculate_bond_metrics(face_value, coupon_rate, market_rate, years, frequency=1):
    """
    Calculates bond cash flows, present values, and durations.
    """
    total_periods = int(years * frequency)
    coupon_payment = (face_value * coupon_rate) / frequency
    rate_per_period = market_rate / frequency
    
    # Generate time periods
    periods = np.arange(1, total_periods + 1)
    years_vector = periods / frequency
    
    # Cash flows (Coupons + Face Value at maturity)
    cash_flows = np.repeat(coupon_payment, total_periods)
    cash_flows[-1] += face_value
    
    # Discount factors: 1 / (1 + r)^t
    discount_factors = 1 / ((1 + rate_per_period) ** periods)
    
    # Present Value of each cash flow
    present_values = cash_flows * discount_factors
    bond_price = np.sum(present_values)
    
    # Weights of each cash flow's PV relative to total bond price
    weights = present_values / bond_price
    
    # Weighted time (for Macaulay Duration)
    weighted_time = years_vector * weights
    macaulay_duration = np.sum(weighted_time)
    
    # Modified Duration
    modified_duration = macaulay_duration / (1 + rate_per_period)
    
    # Store in a DataFrame for easy viewing/plotting
    df = pd.DataFrame({
        'Period': periods,
        'Time (Years)': years_vector,
        'Cash Flow': cash_flows,
        'Discount Factor': discount_factors,
        'Present Value': present_values,
        'Weight': weights
    })
    
    return df, bond_price, macaulay_duration, modified_duration

def plot_present_value_pullback(df, bond_price, macaulay_duration):
    """
    Visualizes how future cash flows are pulled back to Present Value at Time 0,
    and highlights the Macaulay Duration.
    """
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    fig, ax = plt.subplots(figsize=(12, 7))
    
    # Plot cash flows vs present values
    ax.bar(df['Time (Years)'], df['Cash Flow'], width=0.15, alpha=0.3, color='gray', label='Future Cash Flow (FV)')
    bars = ax.bar(df['Time (Years)'], df['Present Value'], width=0.15, alpha=0.8, color='#1f77b4', label='Present Value (PV)')
    
    # Draw the "pullback" effect arrows from FV to PV
    for idx, row in df.iterrows():
        t = row['Time (Years)']
        fv = row['Cash Flow']
        pv = row['Present Value']
        
        # Line connecting FV to PV
        ax.annotate('', xy=(t, pv), xytext=(t, fv),
                    arrowprops=dict(arrowstyle="->", color='red', linestyle=":", lw=1.5))
        
        # Text label for PV amount
        ax.text(t, pv + (max(df['Cash Flow']) * 0.02), f"${pv:.2f}", ha='center', va='bottom', fontsize=9, fontweight='bold')

    # Draw the Present Value at Time 0 (The Bond Price)
    ax.plot(0, bond_price, marker='o', markersize=10, color='green', label=f'Total Bond Price (PV at t=0): ${bond_price:.2f}')
    
    # Draw curved lines indicating discounting back to Time 0
    for idx, row in df.iterrows():
        t = row['Time (Years)']
        pv = row['Present Value']
        # Conceptual arc back to t=0
        x_arc = np.linspace(0, t, 50)
        y_arc = pv * (1 + (t - x_arc) * 0.05) # Purely visual arc effect
        ax.plot(x_arc, y_arc, color='green', alpha=0.15, linestyle='--')

    # Highlight Macaulay Duration as the balance point
    ax.axvline(x=macaulay_duration, color='purple', linestyle='--', linewidth=2, 
               label=f'Macaulay Duration: {macaulay_duration:.2f} Years')
    
    # Visual balance point triangle (Fulcrum)
    ax.plot(macaulay_duration, 0, marker='^', markersize=15, color='purple')
    
    # Formatting
    ax.set_title('Cash Flow Discounting Timeline & Duration', fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel('Time (Years)', fontsize=12)
    ax.set_ylabel('Amount ($)', fontsize=12)
    ax.set_xlim(-0.5, max(df['Time (Years)']) + 0.5)
    ax.set_ylim(0, max(df['Cash Flow']) * 1.15)
    ax.legend(loc='upper right', frameon=True, facecolor='white', edgecolor='none')
    
    plt.tight_layout()
    plt.show()

# --- Execution Parameters ---
FACE_VALUE = 1000
COUPON_RATE = 0.06   # 6%
MARKET_RATE = 0.08   # 8% required return (Yield to Maturity)
YEARS = 5
FREQUENCY = 1        # Annual payments

# Run Calculations
df_cf, price, mac_dur, mod_dur = calculate_bond_metrics(FACE_VALUE, COUPON_RATE, MARKET_RATE, YEARS, FREQUENCY)

# Display Results in Terminal
print("--- BOND METRICS SUMMARY ---")
print(f"Bond Price (PV at t=0): ${price:.2f}")
print(f"Macaulay Duration:     {mac_dur:.2f} years")
print(f"Modified Duration:     {mod_dur:.2f}%\n")
print("--- CASH FLOW BREAKDOWN ---")
print(df_cf.to_string(index=False, formatters={
    'Discount Factor': '{:,.4f}'.format,
    'Cash Flow': '${:,.2f}'.format,
    'Present Value': '${:,.2f}'.format,
    'Weight': '{:,.4f}'.format
}))

# Launch Visualization
plot_present_value_pullback(df_cf, price, mac_dur)