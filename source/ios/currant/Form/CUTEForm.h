//
//  CUTEForm.h
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "FXForms.h"
#import <NGRValidator.h>

@interface CUTEForm : NSObject <FXForm>

- (NSError *)validateFormWithScenario:(NSString *)scenario;

@end
