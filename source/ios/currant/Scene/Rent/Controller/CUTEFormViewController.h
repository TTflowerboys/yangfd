//
//  CUTEFormViewController.h
//  currant
//
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"

@interface FXFormController (CUTE)

- (id)sectionAtIndex:(NSUInteger)index;

- (void)updateSections;

@end

@interface CUTEFormViewController : FXFormViewController

- (BOOL)validateFormWithScenario:(NSString *)scenario;

@end
