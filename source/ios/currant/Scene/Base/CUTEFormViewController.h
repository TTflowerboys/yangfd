//
//  CUTEFormViewController.h
//  currant
//
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"
#import "currant-Swift.h"

@interface FXFormController (CUTE)


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-function"

- (id)sectionAtIndex:(NSUInteger)index;

#pragma clang diagnostic pop

- (void)updateSections;

- (FXFormField *)fieldForKey:(NSString *)key;

@end

@interface CUTEFormViewController : FXFormViewController


- (BOOL)validateFormWithScenario:(NSString *)scenario;

//override
- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif;

@end
