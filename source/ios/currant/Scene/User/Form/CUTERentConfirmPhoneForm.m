//
//  CUTERentConfirmPhoneForm.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentConfirmPhoneForm.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTECountry.h"
#import "CUTEFormTextCell.h"
#import "CUTECommonMacro.h"
#import "CUTEFormButtonCell.h"

@interface CUTERentConfirmPhoneForm () {

    NSArray *_allCountries;

}

@end

@implementation CUTERentConfirmPhoneForm

- (NSArray *)fields {

    NSMutableArray *fields = [NSMutableArray arrayWithArray:@[@{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"RentConfirmPhone/国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTECountry *)[_allCountries firstObject], FXFormFieldAction: @"optionBack"},
                                                              @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"RentConfirmPhone/手机号"), FXFormFieldCell: [CUTEFormTextFieldCell class], FXFormFieldAction: @"onPhoneEdit:"},
                                                              @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"RentConfirmPhone/确认"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
                                                              ]];
    
    return fields;
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

@end
